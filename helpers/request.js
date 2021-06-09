const axios = require('axios');
const xml = require("./xmlRequests");
const parser = require('xml2js').parseString;

const Helpers = {};

Helpers.SendRequest = (method, url, data, headers) => {
    try {
        return  axios({ method, url, data, headers });
    }catch(err){
        return err;
    }
};

const xmlParser = (xml, method) => {
    const obj = [];
    parser(xml, (err, result) => {
      //console.log({ xml });
      let d = result['S:Envelope']['S:Body'][0][`${method}`];
      //console.log(d[0].return[0]);
      obj.push(d[0].return[0]);
      if (err) console.log(err);
      return err;
    });
    return JSON.parse(obj[0]);
};

const xmlParser2 = (xml, method) => {
    const obj = [];
    parser(xml, (err, result) => {
      // console.log({ xml });
      let d = result['soap:Envelope']['soap:Body'][0][`${method}`];
      obj.push(d[0]['BranchNameEnquirySingleitemResult'][0].split("|")[1]);
      if (err) console.log(err);
      return err;
    });
    //console.log(obj);
    return obj;
};

const xmlParser3 = (xml, method) => {
    const obj = [];
    parser(xml, (err, result) => {
      // console.log({ xml });
      let d = result['soap:Envelope']['soap:Body'][0]['BranchNameEnquirySingleitemResponse'][0]['BranchNameEnquirySingleitemResult']
      obj.push(d[0].split("|")[0]);
      if (err) console.log(err);
      return err;
    });
    //console.log(obj);
    return obj;
};

const xmlParser4 = (xml, method) => {
  const obj = [];
  parser(xml, (err, result) => {
    // console.log({ xml });
    let d = result['soap:Envelope']['soap:Body'][0]['BranchFundtransfersingleitem_dcResponse'][0]['BranchFundtransfersingleitem_dcResult']
    obj.push(d[0].split("|")[0]);
    if (err) console.log(err);
    return err;
  });
  //console.log(obj);
  return obj;
};

Helpers.providusAccountCheck = async (accountNumber) => {
    try {
      const request = await xml.ProvidusInternal2(accountNumber);
      const response = await axios.post(process.env.ACCOUNT_VALIDATION, request, {
        timeout: 60 * 3 * 1000,
        headers: { 'Content-Type': 'text/xml' },
      });
      const { data } = response;
      return xmlParser(data, 'ns2:getAccount2WithAccountNoResponse');
    } catch (error) {
      console.log(error);
    }
};

Helpers.getBalance = async (accountNumber) => {
  try {
    console.log(accountNumber);
    const request = await xml.GetBalance(accountNumber);
    console.log(request)
    const response = await axios.post(process.env.ACCOUNT_VALIDATION, request, {
      timeout: 60 * 3 * 1000,
      headers: { 'Content-Type': 'text/xml' },
    });

    console.log(response);
    const { data } = response;
    return xmlParser(data, 'ns2:getAccountBalanceResponse');
  } catch (error) {
    console.log(error);
  }
};

Helpers.externalAccountCheck = async (DBC, AN, SAC) => {
    try {
        const CI = process.env.CI
        const request = await xml.NIPNameEnq(DBC, AN, CI, SAC );
        const response = await axios.post(process.env.ACCOUNT_VALIDATION_EXTERNAL, request, {
        timeout: 60 * 3 * 1000,
        headers: { 'Content-Type': 'text/xml' },
        });
        const { data } = response;
        console.log(data);
        return xmlParser2(data, 'BranchNameEnquirySingleitemResponse');
    } catch (error) {
      console.log(error);
    }
};

Helpers.transferMoney = async (DBC,  CDA, AN, ON, NRN, REF, AMT, INA) => {
    try {
        const CI = process.env.CI;
        const TT = process.env.TT;
        
        const request = await xml.TransferRequest(DBC, CI, CDA, AN, ON, NRN, REF, AMT, INA, TT );
        const response = await axios.post(process.env.ACCOUNT_VALIDATION_EXTERNAL, request, {
        timeout: 60 * 3 * 1000,
        headers: { 'Content-Type': 'text/xml' },
        });
        const { data } = response;
        console.log(data);
        return xmlParser4(data, 'BranchFundtransfersingleitem_dcResponse');
    } catch (error) {
      console.log(error);
    }
};





module.exports = Helpers;
