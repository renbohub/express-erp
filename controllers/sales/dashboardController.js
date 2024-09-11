const express = require('express');
const knex = require('../../config/connection');

const IndexDashboard= async (req, res) => {
    try {
        const dataInv = await knex.table('l_invoices')
            .join('l_sales_orders', 'l_sales_orders.so_id', 'l_invoices.so_id')
            .join('l_quotations', 'l_quotations.quotation_id', 'l_sales_orders.quotation_id')
            .leftJoin('l_sub_quotations', 'l_sub_quotations.quotation_id', 'l_quotations.quotation_id')
            .select(knex.raw('concat(year(invoice_date),"") as x,sum((quotation_total*((100-quotation_disc)/100))*((100-quotation_tax)/100) * (invoice_rate/100)) as y'))
            .whereRaw('l_quotations.client_id = '+req.data.client_id+'')
            .where('invoice_status','>','2')
            .groupByRaw('x')
            .orderBy('x','asc');
        const dataSO = await knex.table('l_sales_orders')
            .join('l_quotations', 'l_quotations.quotation_id', 'l_sales_orders.quotation_id')
            .leftJoin('l_sub_quotations', 'l_sub_quotations.quotation_id', 'l_quotations.quotation_id')
            .select(knex.raw('concat(year(so_date),"") as x,sum((quotation_total*((100-quotation_disc)/100))*((100-quotation_tax)/100)) as y'))
            .where('so_status','>','2')
            .whereRaw('l_quotations.client_id = '+req.data.client_id+'')
            .groupByRaw('x')
            .orderBy('x','asc');
        const dataQuot = await knex.table('l_quotations')
            .leftJoin('l_sub_quotations', 'l_sub_quotations.quotation_id', 'l_quotations.quotation_id')
            .select(knex.raw('concat(year(quotation_date), "") as x,sum((quotation_total*((100-quotation_disc)/100))*((100-quotation_tax)/100)) as y'))
            .whereRaw('l_quotations.client_id = '+req.data.client_id+'')
            .where('quotation_status','>','2')
            .groupByRaw('x')
            .orderBy('x','asc');

       
        var data = {
            'invoice': dataInv,
            'sales_order' : dataSO,
            'quotation' : dataQuot
        }
        console.log(data);
        return res.status(200).send({
            message: "Success",
            data: data
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};
const QueryDashboard= async (req, res) => {
    try {
        var query = req.body.data;
        var qu = req.body.data.split('/');
        var jmlh = qu.length;

        function getAllDatesInMonth(year, month, hoursToAdd) {
            const dates = [];
          
            // Month is 0-indexed (0 = January, 11 = December)
            let date = new Date(year, month, 1);
          
            while (date.getMonth() === month) {
              const newDate = new Date(date);
              newDate.setHours(newDate.getHours() + hoursToAdd); // Add the specified number of hours
              
              // Extract year, month, and day from newDate
              const formattedDate = `${newDate.getFullYear()}/${
                String(newDate.getMonth() + 1)}/${
                String(newDate.getDate())}`;
          
              dates.push(formattedDate);
              date.setDate(date.getDate() + 1); // Move to the next day
            }
          
            return dates;
          }
          
         
        
          
        function getAllMonthsOfYear(year) {
            const months = [];
          
            for (let month = 1; month <= 12; month++) {
              months.push(`${year}/${month}`);
            }
          
            return months;
          }
        if(jmlh==1){
            console.log(jmlh)
            var dataI = await knex.table('l_invoices')
                .join('l_sales_orders', 'l_sales_orders.so_id', 'l_invoices.so_id')
                .join('l_quotations', 'l_quotations.quotation_id', 'l_sales_orders.quotation_id')
                .leftJoin('l_sub_quotations', 'l_sub_quotations.quotation_id', 'l_quotations.quotation_id')
                .select(knex.raw('concat(year(invoice_date),"/",month(invoice_date)) as x,sum((quotation_total*((100-quotation_disc)/100))*((100-quotation_tax)/100) * (invoice_rate/100)) as y'))
                .whereRaw('l_quotations.client_id = '+req.data.client_id+'')
                .where('invoice_status','>','2')
                .whereRaw('year(invoice_date) = '+qu[0]+'')
                .groupByRaw('x')
                .orderBy('x','asc');
            var dataS = await knex.table('l_sales_orders')
                .join('l_quotations', 'l_quotations.quotation_id', 'l_sales_orders.quotation_id')
                .leftJoin('l_sub_quotations', 'l_sub_quotations.quotation_id', 'l_quotations.quotation_id')
                .select(knex.raw('concat(year(so_date),"/",month(so_date)) as x,sum((quotation_total*((100-quotation_disc)/100))*((100-quotation_tax)/100)) as y'))
                .where('so_status','>','2')
                .whereRaw('l_quotations.client_id = '+req.data.client_id+'')
                .whereRaw('year(so_date) = '+qu[0]+'')
                .groupByRaw('x');
            var dataQ = await knex.table('l_quotations')
                .leftJoin('l_sub_quotations', 'l_sub_quotations.quotation_id', 'l_quotations.quotation_id')
                .select(knex.raw('concat(year(quotation_date), "/",month(quotation_date)) as x,sum((quotation_total*((100-quotation_disc)/100))*((100-quotation_tax)/100)) as y'))
                .whereRaw('l_quotations.client_id = '+req.data.client_id+'')
                .whereRaw('year(quotation_date) = '+qu[0]+'')
                .where('quotation_status','>','2')
                .groupByRaw('x').orderBy('x','asc');

                var datesInMonth = getAllMonthsOfYear(qu[0])
                var dataInv = [];
                var dataQuot = [];
                var dataSO = [];
                for (let i = 0; i < datesInMonth.length; i++) {
                   var dqsum = 0
                   var disum = 0
                   var dssum = 0
                   for (let iq = 0; iq < dataQ.length; iq++) {
                     if(dataQ[iq].x == datesInMonth[i]){
                        dqsum = dataQ[iq].y
                     }
                   }
                   for (let ii = 0; ii < dataI.length; ii++) {
                    if(dataI[ii].x == datesInMonth[i]){
                       disum = dataI[ii].y
                    }
                  }
                  for (let is = 0; is < dataS.length; is++) {
                    if(dataS[is].x == datesInMonth[i]){
                       dssum = dataS[is].y
                    }
                  }
                   var pushQ = {
                     'x' : datesInMonth[i],
                     'y' : dqsum
                   }
                   dataQuot.push(pushQ)
                   var pushI = {
                    'x' : datesInMonth[i],
                    'y' : disum
                  }
                  dataInv.push(pushI)
                  var pushS = {
                    'x' : datesInMonth[i],
                    'y' : dssum
                  }
                  dataSO.push(pushS)
                }
                console.log(dataQuot)
                dataQ = dataQuot
                dataI = dataInv
                dataS = dataSO
        }else if(jmlh==2){
                var dataI = await knex.table('l_invoices')
                    .join('l_sales_orders', 'l_sales_orders.so_id', 'l_invoices.so_id')
                    .join('l_quotations', 'l_quotations.quotation_id', 'l_sales_orders.quotation_id')
                    .leftJoin('l_sub_quotations', 'l_sub_quotations.quotation_id', 'l_quotations.quotation_id')
                    .select(knex.raw('concat(year(invoice_date),"/",month(invoice_date),"/",day(invoice_date)) as x,sum((quotation_total*((100-quotation_disc)/100))*((100-quotation_tax)/100) * (invoice_rate/100)) as y'))
                    .whereRaw('l_quotations.client_id = '+req.data.client_id+'')
                    .where('invoice_status','>','2')
                    .whereRaw('year(invoice_date) = '+qu[0]+'')
                    .whereRaw('month(invoice_date) = '+qu[1]+'')
                    .groupByRaw('x').orderBy('x','asc');
                var dataS = await knex.table('l_sales_orders')
                    .join('l_quotations', 'l_quotations.quotation_id', 'l_sales_orders.quotation_id')
                    .leftJoin('l_sub_quotations', 'l_sub_quotations.quotation_id', 'l_quotations.quotation_id')
                    .select(knex.raw('concat(year(so_date),"/",month(so_date),"/",day(so_date)) as x,sum((quotation_total*((100-quotation_disc)/100))*((100-quotation_tax)/100)) as y'))
                    .where('so_status','>','2')
                    .whereRaw('l_quotations.client_id = '+req.data.client_id+'')
                    .whereRaw('year(so_date) = '+qu[0]+'')
                    .whereRaw('month(so_date) = '+qu[1]+'')
                    .groupByRaw('x').orderBy('x','asc');
                var dataQ = await knex.table('l_quotations')
                    .leftJoin('l_sub_quotations', 'l_sub_quotations.quotation_id', 'l_quotations.quotation_id')
                    .select(knex.raw('concat(year(quotation_date), "/",month(quotation_date),"/",day(quotation_date)) as x,sum((quotation_total*((100-quotation_disc)/100))*((100-quotation_tax)/100)) as y'))
                    .whereRaw('l_quotations.client_id = '+req.data.client_id+'')
                    .whereRaw('year(quotation_date) = '+qu[0]+'')
                    .whereRaw('month(quotation_date) = '+qu[1]+'')
                    .where('quotation_status','>','2')
                    .groupByRaw('x').orderBy('x','asc');
                const year = qu[0];
                const month = parseInt(qu[1])-1; // August (0-indexed, so July is 6)
                const hoursToAdd = 7;
                const datesInMonth = getAllDatesInMonth(year, month, hoursToAdd);
                
                var dataInv = [];
                var dataQuot = [];
                var dataSO = [];
                for (let i = 0; i < datesInMonth.length; i++) {
                   var dqsum = 0
                   var disum = 0
                   var dssum = 0
                   for (let iq = 0; iq < dataQ.length; iq++) {
                     if(dataQ[iq].x == datesInMonth[i]){
                        dqsum = dataQ[iq].y
                     }
                   }
                   for (let ii = 0; ii < dataI.length; ii++) {
                    if(dataI[ii].x == datesInMonth[i]){
                       disum = dataI[ii].y
                    }
                  }
                  for (let is = 0; is < dataS.length; is++) {
                    if(dataS[is].x == datesInMonth[i]){
                       dssum = dataS[is].y
                    }
                  }
                   var pushQ = {
                     'x' : datesInMonth[i],
                     'y' : dqsum
                   }
                   dataQuot.push(pushQ)
                   var pushI = {
                    'x' : datesInMonth[i],
                    'y' : disum
                  }
                  dataInv.push(pushI)
                  var pushS = {
                    'x' : datesInMonth[i],
                    'y' : dssum
                  }
                  dataSO.push(pushS)
                }
                console.log(dataQuot)
                dataQ = dataQuot
                dataI = dataInv
                dataS = dataSO
            }
           
            // Example usage:
            

       
        var data = {
            'invoice': dataI,
            'sales_order' : dataS,
            'quotation' : dataQ
        }
        console.log(data);
        return res.status(200).send({
            message: "Success",
            data: data
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};



module.exports = { IndexDashboard ,QueryDashboard};
