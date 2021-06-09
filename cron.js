const cron = require('node-cron');
const sql = require('mssql');
const moment = require('moment');
const request = require("./helpers/request");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();


module.exports = () => {
    // run every day at 5 pm
    cron.schedule('0 00 17 * * *', () => {
        const runcron =  async () => {
           await sql.connect(process.env.MSSQL);
           const deleteStatus = "false"
           const check = await sql.query`SELECT * from stand_order_detail WHERE end_date <= ${moment().format("YYYY-MM-DD")} and delete_status='false'`;
           const checkrecords = check.recordset;

           checkrecords.map(async (rec) => {
            const recupdate = await sql.query`UPDATE stand_order_detail SET delete_status = 'true',status='deactivated' WHERE stand_order_id=${rec.stand_order_id}`;
           })

           const result = await sql.query`SELECT * from stand_order_detail WHERE next_run_date = ${moment().format("YYYY-MM-DD")} and delete_status = ${deleteStatus} and status='approved'`;
           const records = result.recordset;
          
      
           records.map( async(record) => {
             const reference = uuidv4();
             const transaction_id = uuidv4();
             const newDate = new Date();
             const status = "pending";
             const num_of_retries = 0
       
             await sql.connect(process.env.MSSQL);
             const result1 = await sql.query`INSERT INTO [stand_order_transaction](
               [transaction_id]
                  ,[amount]
                  ,[date]
                  ,[stand_order_id]
                  ,[num_of_retries]
                  ,[status]
                  ,[inputter_id]
                  ,[approval_id]
                  ,[frequency]
                  ,[branch_id]
                  )
           
               VALUES(
               ${transaction_id}, 
               ${record.amount}, 
               ${newDate},
               ${record.stand_order_id}, 
               ${num_of_retries},
               ${status},
               ${record.inputter_id},
               ${record.approval_id},
               ${record.frequency},
               ${record.branch_id}
               )`;
       
             const body = {
               DBC : record.beneficiary_bank, 
               CDA: record.beneficiary_account_number,
               AN : record.beneficiary_account_name, 
               ON : record.account_name,
               NRN: record.remarks,
               REF: reference, 
               AMT: record.amount, 
               INA: record.account_number
             }
             const response = await request.SendRequest(
               'POST',
               'http://localhost:4110/api/transfer',
               body,
               {
                 headers: { 'Content-Type': 'application/json' },
               }
             );

            let update_next_run_date
            
            if (record.frequency === "Daily"){
            update_next_run_date = moment(moment(response.next_run_date).add(1, 'days')).format('YYYY-MM-DD');
            }else if (record.frequency === "Weekly"){
            update_next_run_date = moment(moment(response.next_run_date).add(7, 'days')).format('YYYY-MM-DD');
            }else if (record.frequency === "Monthly"){
            update_next_run_date = moment(moment(response.next_run_date).add(1, 'months')).format('YYYY-MM-DD');
            }else if (record.frequency === "Quartely"){
            update_next_run_date = moment(moment(response.next_run_date).add(3, 'months')).format('YYYY-MM-DD');
            }

            const update2 = await sql.query`UPDATE stand_order_detail SET next_run_date = ${update_next_run_date} WHERE stand_order_id=${record.stand_order_id}`;
       
            if (response.data.code[0] == '00'){
               const update = await sql.query`UPDATE stand_order_transaction SET status = 'success' WHERE transaction_id=${transaction_id}`;
             }
           })
         }
        
         runcron();
         console.log('running a task every minute');
    });

    // running every 2 hours daily
    cron.schedule('0 */2 * * *', () => {
        const runcron =  async () => {
          console.log("2 hours daily")
           await sql.connect(process.env.MSSQL);
           const deleteStatus = "false"
           const result = await sql.query`SELECT * from stand_order_transaction WHERE num_of_retries < 3 and status != 'success' and frequency='Daily'`;
           const records = result.recordset;
      
          records.map( async(record) => {
            const reference = uuidv4();
             const result1 = await sql.query`SELECT * from stand_order_detail WHERE delete_status = ${deleteStatus} and stand_order_id=${record.stand_order_id} `;
             const newrecord = result1.recordset[0]
             const body = {
               DBC : newrecord.beneficiary_bank, 
               CDA: newrecord.beneficiary_account_number,
               AN : newrecord.beneficiary_account_name, 
               ON : newrecord.account_name,
               NRN: newrecord.remarks,
               REF: reference, 
               AMT: newrecord.amount, 
               INA: newrecord.account_number
             }
             const response = await request.SendRequest(
               'POST',
               'http://localhost:4110/api/transfer',
               body,
               {
                 headers: { 'Content-Type': 'application/json' },
               }
             );
            
             const num_of_retries = record.num_of_retries + 1;


             const update1 = await sql.query`UPDATE stand_order_transaction SET num_of_retries = ${num_of_retries} WHERE transaction_id=${record.transaction_id}`;

            if (response.data.code[0] == '00'){
               const update2 = await sql.query`UPDATE stand_order_transaction SET status = 'success' WHERE transaction_id=${record.transaction_id}`;
            }else if (num_of_retries === 3) {
              const update3 = await sql.query`UPDATE stand_order_transaction SET status = 'failed' WHERE transaction_id=${record.transaction_id}`;
            }
           }) 
         }
        
         runcron();
         console.log('running a task every minute');
    });

    // run everyday at 9am
    cron.schedule('0 00 09 * * *', () => {
      const runcron =  async () => {
        console.log("run every morning")
         await sql.connect(process.env.MSSQL);
         const deleteStatus = "false"
         const result = await sql.query`SELECT * from stand_order_transaction WHERE num_of_retries < 3 and status != 'success' and frequency!='Daily'`;
         const records = result.recordset;
    
        records.map( async(record) => {
          const reference = uuidv4();
           const result1 = await sql.query`SELECT * from stand_order_detail WHERE delete_status = ${deleteStatus} and stand_order_id=${record.stand_order_id} `;
           const newrecord = result1.recordset[0]
           const body = {
             DBC : newrecord.beneficiary_bank, 
             CDA: newrecord.beneficiary_account_number,
             AN : newrecord.beneficiary_account_name, 
             ON : newrecord.account_name,
             NRN: newrecord.remarks,
             REF: reference, 
             AMT: newrecord.amount, 
             INA: newrecord.account_number
           }
           const response = await request.SendRequest(
             'POST',
             'http://localhost:4110/api/transfer',
             body,
             {
               headers: { 'Content-Type': 'application/json' },
             }
           );
          
           const num_of_retries = record.num_of_retries + 1;


           const update1 = await sql.query`UPDATE stand_order_transaction SET num_of_retries = ${num_of_retries} WHERE transaction_id=${record.transaction_id}`;
     
          if (response.data.code[0] == '00'){
             const update2 = await sql.query`UPDATE stand_order_transaction SET status = 'success' WHERE transaction_id=${record.transaction_id}`;
          }else if (num_of_retries === 3) {
            const update3 = await sql.query`UPDATE stand_order_transaction SET status = 'failed' WHERE transaction_id=${record.transaction_id}`;
          }
         }) 
       }
      
       runcron();
  });
       
} 