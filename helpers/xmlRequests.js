const xml = {};

xml.GetBalance = (AN) => {
   return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:prov="http://providus.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <prov:getAccountBalance>
         <account_no>${AN}</account_no>
      </prov:getAccountBalance>
   </soapenv:Body>
</soapenv:Envelope>`;
};

xml.ProvidusInternal = (AN) => {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:prov="http://providus.com/">
     <soapenv:Header/>
     <soapenv:Body>
        <prov:getAccountName>
           <account_no>${AN}</account_no>
        </prov:getAccountName>
     </soapenv:Body>
  </soapenv:Envelope>`;
};

xml.NIPNameEnq = (DBC, AN, CI, SAC) => {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soapenv:Header>
     <tem:AuthHeader>
        <tem:UserName>nipConnect</tem:UserName>
        <tem:Password>9r0v1du5_l1v3</tem:Password>
     </tem:AuthHeader>
  </soapenv:Header>
   <soapenv:Body>
  <tem:BranchNameEnquirySingleitem>
         <tem:myDestinationBankCode>${DBC}</tem:myDestinationBankCode>
         <tem:myAccountNumber>${AN}</tem:myAccountNumber>
         <tem:myChannelCode>${CI}</tem:myChannelCode>
         <tem:mySourceAccountNumber>${SAC}</tem:mySourceAccountNumber>
      </tem:BranchNameEnquirySingleitem>
    </soapenv:Body>
</soapenv:Envelope>`;
};

xml.TransferRequest = (DBC, CI, CDA, AN, ON, NRN, REF, AMT, INA, TT) => {
    return `
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/">
    <soap:Header>
       <tem:AuthHeader>
          <!--Optional:-->
          <tem:UserName>nipConnectest</tem:UserName>
          <!--Optional:-->
          <tem:Password>9r0v1du5_t35t</tem:Password>
       </tem:AuthHeader>
    </soap:Header>
    <soap:Body>
       <tem:BranchFundtransfersingleitem_dc>
          <!--Optional:-->
          <tem:myDestinationBankCode>${DBC}</tem:myDestinationBankCode>
          <!--Optional:-->
          <tem:myChannelCode>${CI}</tem:myChannelCode>
          <!--Optional:-->
          <tem:myCustDestinationAccountNumber>${CDA}</tem:myCustDestinationAccountNumber>
          <!--Optional:-->
          <tem:myAccountName>${AN}</tem:myAccountName>
          <!--Optional:-->
          <tem:myOriginatorName>${ON}</tem:myOriginatorName>
          <!--Optional:-->
          <tem:myNarration>${NRN}</tem:myNarration>
          <!--Optional:-->
          <tem:myPaymentReference>${REF}</tem:myPaymentReference>
          <!--Optional:-->
          <tem:myAmount>${AMT}</tem:myAmount>
          <!--Optional:-->
          <tem:myCustomerSourceAccountNumber>${INA}</tem:myCustomerSourceAccountNumber>
          <tem:TranType>${TT}</tem:TranType>
       </tem:BranchFundtransfersingleitem_dc>
    </soap:Body>
 </soap:Envelope>
    `
}


module.exports = xml;
