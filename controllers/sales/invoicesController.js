var knex    = require('../../config/connection')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jsPDF } = require("jspdf");
require('jspdf-autotable');
const fs = require('fs');
const imageSize = require('image-size');
const { fontSize } = require('pdfkit');
const QRCode = require('qrcode');
const Jimp = require('jimp');

const indexInv = async (req, res) => {
  try {
      const id = req.data.client_id;

      // DataTables parameters
      const draw = req.query.draw;
      const start = parseInt(req.query.start);
      const length = parseInt(req.query.length);
      const searchValue = req.query.search.value;
      const orderColumnIndex = req.query.order[0].column;
      const orderColumn = req.query.columns[orderColumnIndex].data;
      const orderDir = req.query.order[0].dir;

      // Count total records
      const totalRecords = await knex('l_invoices').join('l_sales_orders','l_sales_orders.so_id','l_invoices.so_id').join('l_quotations','l_quotations.quotation_id','l_sales_orders.quotation_id')
          .join('l_customers','l_customers.customer_id','l_quotations.customer_id')
          .whereRaw('l_quotations.client_id= '+id+'')
          .count({ count: '*' })
          .first();

      // Filtered records query
      let filteredRecordsQuery =  knex('l_invoices').join('l_sales_orders','l_sales_orders.so_id','l_invoices.so_id').join('l_quotations','l_quotations.quotation_id','l_sales_orders.quotation_id').join('l_customers','l_customers.customer_id','l_quotations.customer_id')
      .whereRaw('l_quotations.client_id= '+id+'');

      // Apply search filter if provided
      if (searchValue) {
          filteredRecordsQuery = filteredRecordsQuery.andWhere(function() {
              this.where('quotation_name', 'like', `%${searchValue}%`)
                  .orWhere('so_number', 'like', `%${searchValue}%`);
                  // Add more columns as needed for the search
          });
      }

      // Count filtered records
      const filteredRecords = await filteredRecordsQuery.clone().count({ count: '*' }).first();

      // Apply pagination and sorting
      const l_quotation = await filteredRecordsQuery
          .orderBy(orderColumn, orderDir)
          .offset(start)
          .limit(length);
      
      // Prepare response for DataTables
      res.status(200).send({
          draw: draw,
          recordsTotal: totalRecords.count,
          recordsFiltered: filteredRecords.count,
          data: l_quotation
      });
  } catch (e) {
     console.log(e);
      res.status(500).send({
          message: "Error",
          error: e.message
      });
  }
};
const indexInvId = async (req, res) => {
  try {
      const id = req.data.client_id;
      const token = req.query.token;
      // Count total records
      var data = await knex.table('l_invoices').join('l_sales_orders','l_sales_orders.so_id','l_invoices.so_id').join('l_quotations','l_quotations.quotation_id','l_sales_orders.quotation_id')
        .join('l_customers', 'l_customers.customer_id', 'l_quotations.customer_id')
        .where({
            invoice_token: token,
        });
        var sub = await knex.table('l_sub_quotations').where({
          quotation_id:data[0].quotation_id,
          client_id:id
        });
        return res.status(200).send({
            message: "Success",
            data: data,
            sub: sub,
            role: req.data.role_id
        });
    } catch (e) {
        console.log(e)
        res.status(400).send({
            message: "Database Issue",
            data: e,
        });
    }
};
const createInv = async(req, res ) => {
  try {
      var randomString =  crypto.randomBytes(16).toString('hex'); 
      var id= req.data.client_id
      var user_id= req.data.user_id
      const [dayDate, monthDate, yearDate] = req.body.invoice_date.split('-');
      const f1 = `${dayDate}-${monthDate}-${yearDate}`;
      const [dayDate1, monthDate1, yearDate1] = req.body.invoice_exp.split('-');
      const f2 = `${dayDate1}-${monthDate1}-${yearDate1}`;
      var stats = await knex('l_sales_orders').update({
        so_status: 4
      }).where({
        so_id:req.body.so_id
      });
      var account = await knex('l_accounts').where({
        client_id: req.data.client_id
      })
      var l_quotation = await 
          knex('l_invoices').insert({
            invoice_date: f1,
            invoice_exp: f2,
            invoice_status: 1,
            invoice_token: randomString,
            invoice_rate: req.body.invoice_rate,
            invoice_tittle: req.body.invoice_tittle,
            created_by: user_id,
            account_id: account[0].account_id,
            so_id: req.body.so_id
          })
      res.status(200).send(
        {
          message: "Success",
          data: l_quotation
        }
      );
  } 
  catch (e) {
    console.log(e);
    res.status(400).send(
      {
        message: "Error",
        data: e
      }
    );
  }
}
const addSubInv= async (req, res) => {
  try {
      const id = req.data.client_id;
      console.log(req.body);
      var body= req.body;
      var q_d = await knex.table('l_sub_quotations')
      .where({
        quotation_id: req.body.quotation_id,
        client_id: id
      })
      .del();
      console.log(q_d);
      var group_id = 0
      for (let i = 0; i < body.product_id.length; i++) {
         if (body.line_type[i] == 1) {
           group_id++ 
         }
         const formattedString = body.quotation_price[i];
         const price = formattedString.replace(/,/g, '');
         var total = price * parseInt(body.quotation_qty[i]);
         var order = i +1;
         var insert = await knex.table('l_sub_quotations').insert({
           quotation_id: body.quotation_id,
           quotation_order: order,
           client_id:id,
           group_no: group_id,
           line_type: body.line_type[i],
           product_id: body.product_id[i],
           quotation_price: price,
           quotation_total: total,
           quotation_desc: body.quotation_desc[i],
           unit_id: body.unit_id[i],
           quotation_qty: body.quotation_qty[i],
         })
      }
        var data = await knex.table('l_quotations').where({
          client_id:id,
          quotation_id:req.body.quotation_id
        });
        return res.status(200).send({
            message: "Success",
            data: data
        });
    } catch (e) {
       console.log(e)
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};
const updateInv = async(req, res ) => {
  try {
      const [dayDate, monthDate, yearDate] = req.body.invoice_date.split('-');
      const f1 = `${dayDate}-${monthDate}-${yearDate}`;
      console.log(req.body.quotation_note)
      const [dayExp, monthExp, yearExp] = req.body.invoice_exp.split('-');
      const f2 = `${dayExp}-${monthExp}-${yearExp}`;
      var l_quotation = await 
      knex('l_invoices').update({
        invoice_tittle: req.body.invoice_tittle,
        invoice_rate: req.body.invoice_rate,
        invoice_date  :f1,
        invoice_exp   :f2,
        account_id   :req.body.account_id,
        invoice_note  :req.body.invoice_note,
      }).where({
        invoice_token:req.body.id
      })
      
      res.status(200).send(
        {
          message: "Success",
          data: 'data'
        }
      );
  } 
  catch (e) {
      console.log(e)
  }
}
const deleteInv= async(req, res ) => {
  try {
      var id= req.data.customer_id
      var l_quotation = await 
      knex('l_quotations').where({
        quotation_id:req.body.quotation_id
      }).del()
      res.status(200).send(
        {
          message: "Success",
          data: l_quotation
        }
      );
  } 
  catch (e) {
   
  }
}
const updateStatusInv = async(req, res ) => {
  try {
    var status = req.body.status;
    var query = await knex('l_invoices').join('l_sales_orders','l_sales_orders.so_id','l_invoices.so_id').where({
      invoice_token:req.body.id
    })
    var qs = query[0].invoice_status
    var q_count = await knex('l_invoices').join('l_sales_orders','l_sales_orders.so_id','l_invoices.so_id').join('l_quotations','l_quotations.quotation_id','l_sales_orders.quotation_id').where({
      client_id:req.data.client_id
    }).andWhereRaw('MONTH(invoice_date) = MONTH(NOW()) and invoice_number != ""');
    
    var total = q_count.length + 1;
    var cust = req.data.client_allias
    
    function monthToRoman(month) {
      const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      return romanMonths[month - 1];
    }
    
    function numberWithLeadingZeros(number, length) {
      return String(number).padStart(length, '0');
    }
    
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2)
    const month = monthToRoman(date.getMonth() + 1)
    const total_out = numberWithLeadingZeros(total, 5);
    
    var name = ""+cust+"/INV/"+year+"/"+month+"/"+total_out+"";
    if(status==1){ 
      if(qs==2){
      var l_quotation = await 
            knex('l_invoices').update({
              invoice_status:req.body.status
            }).where({
              invoice_token:req.body.id
            })
      }else if(qs==3){
        var l_quotation = await 
        knex('l_invoices').update({
          invoice_status:req.body.status
        }).where({
          invoice_token:req.body.id
        })
        var now_rate = query[0].invoice_created
        var plus_rate = parseFloat(query[0].invoice_created) - parseFloat(query[0].invoice_rate) 
        var rate = await knex('l_sales_orders').update({
          invoice_created: plus_rate
        }).where({
          so_id:query[0].so_id
        })
      }
    }else if(status==2){
      if(qs==1){
        var l_quotation = await 
        knex('l_invoices').update({
          invoice_status:req.body.status
        }).where({
          invoice_token:req.body.id
        })
      }else{
        return res.status(404).send(
          {
            message: "error",
            data: "role error"
          }
        );
      }
    }else if(status==3){
      if(qs==2){
        console.log(query[0])
        if(query[0].invoice_number=='' || query[0].invoice_number==null){
          var a = name
        }else{
          var a = query[0].invoice_number
        } 
        var l_quotation = await knex('l_invoices').update({
          invoice_status:req.body.status,
          invoice_number:a
        }).where({
          invoice_token:req.body.id
        })
        var now_rate = query[0].invoice_created
        var plus_rate = parseFloat(query[0].invoice_created) + parseFloat(query[0].invoice_rate) 
        var rate = await knex('l_sales_orders').update({
          invoice_created: plus_rate
        }).where({
          so_id:query[0].so_id
        })
      }else{
       return res.status(404).send(
          {
            message: "error",
            data: "role error"
          }
        );
      }
    }else{
      return res.status(404).send(
        {
          message: "error",
          data: "status not declared"
        }
      );
    }
      
   return res.status(200).send(
      {
        message: "Success",
        data: ''
      }
    );
  } 
  catch (e) {
      console.log(e);
  }
}
const pdfInv = async(req, res ) => {
  try {
    var img = req.data.client_main_logo.toString('base64')
  
    var query = await knex('l_invoices').join('l_accounts','l_accounts.account_id','l_invoices.account_id').join('l_sales_orders','l_sales_orders.so_id','l_invoices.so_id').join('l_quotations','l_quotations.quotation_id','l_sales_orders.quotation_id').join('l_customers','l_customers.customer_id','l_quotations.customer_id').join('l_tops','l_tops.top_id','l_quotations.top_id')
                .where({invoice_token:req.query.token})
   
    var table_data = []
    var subs = await knex('l_sub_quotations').join('l_units','l_units.unit_id','l_sub_quotations.unit_id')
                .where({quotation_id:query[0].quotation_id}

                )  
    var totals = await knex('l_sub_quotations').select(knex.raw('sum(quotation_total) as price'))
          .where({quotation_id:query[0].quotation_id})
          .groupBy('group_no');
    if(query.length==0){
      res.status(404).send({       
        message: "Error",
        errors: "Data not Found"

       })
    }
    var body = []
    var price = 0;
    var total = 0;
    var desc = '';
    var data_nl = 0;
    for (let io = 0; io < subs.length; io++) {
      const r = (subs[io].quotation_desc.match(/\n/g) || []).length
      data_nl += parseInt(r);
    }
    var baris = subs.length + data_nl;
    if(baris>16){
      for (let u = 0; u < subs.length; u++) {
        if (subs[u].group_no == 2 && subs[u].line_type == 1) {
          body.push(data_x)
          var price = 0
          total = 0
        }
        if(subs[u].line_type == 1){
           var desc = subs[u].quotation_desc
        }
        price += parseFloat(subs[u].quotation_price) * (query[0].invoice_rate/100);
        total += parseFloat(subs[u].quotation_total) * (query[0].invoice_rate/100);
        var data_x = {
          q_desc : desc,
          q_qty : '1',
          q_unit: 'lot',
          q_line: 0,
          q_price: String(price.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          q_total: total.toFixed(0)
        }
        if (subs[u].group_no >= 2 && subs[u].line_type == 1) {
          body.push(data_x)
          var price = 0
          total = 0
        }
      }
    }else{
      for (let u = 0; u < subs.length; u++) {
        if (subs[u].line_type == 1){
          var desc =  subs[u].quotation_desc
          var qty = '';
          var unit  =  '';
          var g = parseInt(subs[u].group_no)-1;
          var price = ''
          var t =  totals[g].price * (query[0].invoice_rate/100);
          var total = String(t.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }else if(subs[u].line_type == 2){
          var desc =  subs[u].quotation_desc
          var qty = subs[u].quotation_qty
          var unit  =  subs[u].unit_desc;
          var price1 = subs[u].quotation_price * (query[0].invoice_rate/100);
          var total2 = subs[u].quotation_total * (query[0].invoice_rate/100);
          var price = price1.toFixed(2)
          var total = total2.toFixed(2)
        }else{
          var desc =  subs[u].quotation_desc
          var qty = '';
          var unit  =  '';
          var price = '';
          var total = '';
        }
        
        var data_x = {
          q_desc : desc,
          q_qty : qty,
          q_unit: unit,
          q_line: subs[u].line_type,
          q_price: String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          q_total: String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
        body.push(data_x)
      }
    }

    var f_tax =  query[0].quotation_tax;
    var f_disc = query[0].quotation_disc ;
    var f_total = 0
    for (let t = 0; t < subs.length; t++) {
      f_total += parseFloat(subs[t].quotation_total)* (query[0].invoice_rate/100);
    }
    
    var f_after_disc = f_total - (f_total * (parseFloat(f_disc)/100));
    var f_total_tax = f_after_disc * (parseFloat(f_tax)/100);
    var f_ammount = f_after_disc + f_total_tax;
    
    var fs_total = String(f_total.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var fs_after_disc = String(f_after_disc.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    var fs_total_tax = String(f_total_tax.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    var fs_ammount = String(f_ammount.toFixed(0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    const date = query[0].invoice_exp;
    // var d_body = await knex('l_sub_quotations)')
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const date1 = query[0].so_date;
    const year1 = date1.getFullYear();
    const month1 = String(date1.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day1= String(date1.getDate()).padStart(2, '0');
    const formattedDate1 = `${year1}-${month1}-${day1}`;



    const doc = new jsPDF('p','mm',[297, 210]);
  
    // Example Base64 image string (small red dot)
    doc.setProperties({
      title: "Request For Quotation"
   })
   var im = img.toString('base64')
   var imgData = 'data:image/jpeg;base64,'+im+''
   const dimensions = imageSize(Buffer.from(im, 'base64'));
    if(query[0].invoice_note==null){
      note_inv = ''
    }else{
      note_inv = query[0].invoice_note
    }
    const aspectRatio = dimensions.width  / dimensions.height;
    const newWidth = 20;
    const newHeight = newWidth * aspectRatio;
      
    doc.addImage(imgData, 'PNG', 10,12,newHeight , newWidth);
    doc.setFontSize(20);
    doc.text('INVOICE', 150, 24);
    doc.setLineWidth(20);
    doc.setDrawColor(99, 153, 67);
    doc.autoTable({
      styles: { fillColor: [99,153, 67] },
      head:[[""]],
      startY:33,
    })
    doc.autoTable({
      body: [
        [
          { content: ''+req.data.client_company+'', colSpan: 1, rowSpan: 2, 
            styles: { 
              halign: 'left' ,
              valign: '',
              cellWidth: 110,
              fontStyle: 'bold',
              fontSize:8,
              cellPadding: {top:0,bottom:0},
              fillColor:'white'
            } 
          }, 
          { content: 'PO Number', 
            colSpan: 1, 
            rowSpan: 1, 
            styles: { 
              halign: 'center' ,
              fontSize:8,
              cellPadding: {top:1,bottom:1},
            }
          }
        ],[
          { 
            content: ''+query[0].so_po_customer+'', 
            colSpan: 1, 
            rowSpan: 1, 
            styles: { 
              halign: 'center' ,
              fontSize:8,
              cellPadding: {top:1,bottom:1},
            }
          }
        ],[
          { content: ''+req.data.client_address+'\n\n'+req.data.client_email+'\n\n'+req.data.client_number+'', 
            colSpan: 1, 
            rowSpan: 6, 
            styles: { 
              halign: 'left' ,
              cellWidth: 110,
              fillColor:'white',
              fontSize:8,
              cellPadding: {top:1,bottom:1},
            } 
          },
          { content: 'Invoice Date', 
            colSpan: 1, 
            rowSpan: 1, 
            styles: { 
              halign: 'center' ,
              fontSize:8,
              cellPadding: {top:1,bottom:1},
            }
          }
        ],[
          { content: ''+formattedDate1+'', 
            colSpan: 1, 
            rowSpan: 1, 
            styles: { 
              halign: 'center' ,
              fontSize:8,
              cellPadding: {top:1,bottom:1},
            }
          }
        ],[
          { content: 'Invoice Number', 
            colSpan: 1, 
            rowSpan: 1, 
            styles: { 
              halign: 'center' ,
              fontSize:8,
              cellPadding: {top:1,bottom:1},
            }
          }
        ],[
          { content: ''+query[0].invoice_number+'', 
            colSpan: 1, 
            rowSpan: 1, 
            styles: { 
              halign: 'center' ,
              fontSize:8,
              cellPadding: {top:1,bottom:1},
            }
          }
        ],[
          { content: 'Title', 
            colSpan: 1, 
            rowSpan: 1, 
            styles: { 
              halign: 'center' ,
              fontSize:8,
              cellPadding: {top:1,bottom:1},
            }
          }
        ],[
          { content: ''+query[0].invoice_tittle+' - '+query[0].quotation_name+'', 
            colSpan: 1, 
            rowSpan: 1, 
            styles: { 
              halign: 'center' ,
              fontSize:8,
              cellPadding: {top:1,bottom:1},
            }
          }
        ],
        [
          { content: 'Customer Info', 
            colSpan: 2, 
            rowSpan: 1, 
            styles: { 
              halign: 'left' ,
              fillColor: 'white',
              lineWidth: {bottom:1},
              fontSize:8,
              cellPadding: {top:1,bottom:1},
            }
          }
        ],[
          { content: ''+query[0].customer_name+'', 
            colSpan: 2, 
            rowSpan: 1, 
            styles: { 
              halign: 'left' ,
              fillColor: 'white',
              fontSize:8,
              cellPadding: {top:0,bottom:1,left:2}
            }
          }
        ],[
          { content: ''+query[0].customer_company+'', 
            colSpan: 2, 
            rowSpan: 1, 
            styles: { 
              halign: 'left' ,
              fillColor: 'white',
              fontSize:8,
              cellPadding: {top:0,bottom:1,left:2}
            }
          }
        ],[
          { content: ''+query[0].customer_address+'', 
            colSpan: 2, 
            rowSpan: 1, 
            styles: { 
              halign: 'left' ,
              fillColor: 'white',
              fontSize:8,
              cellPadding: {top:0,bottom:2,left:2}
            }
          }
        ]    
      ],
      startY:40,
      margin: { top: 0,bottom:0},
    })
    var table_empty_count = 15- table_data.length;
    var data = []
    var s_n = { fontSize:9 ,cellPadding: {top:1,bottom:1, left:1,right:1},halign: 'right',lineWidth: {right:0.2,left:0.2,bottom:0.2}}
    var s_e = { fontSize:9 ,cellPadding: {top:1,bottom:1, left:1,right:1},halign: 'left',lineWidth: {right:0.2,left:0.2,bottom:0.2}}
    var s_c = { fontSize:9 ,cellPadding: {top:1,bottom:1, left:1,right:1},halign: 'center',lineWidth: {right:0.2,left:0.2,bottom:0.2}}

    var s_n1 = { fillColor: [0, 215, 187],fontSize:9 ,cellPadding: {top:1,bottom:1, left:1,right:1},halign: 'right',lineWidth: {right:0.2,left:0.2,bottom:0.2}}
    var s_e1 = { fillColor: [0, 215, 187],fontSize:9 ,cellPadding: {top:1,bottom:1, left:1,right:1},halign: 'left',lineWidth: {right:0.2,left:0.2,bottom:0.2}}
    var s_c1 = { fillColor: [0, 215, 187],fontSize:9 ,cellPadding: {top:1,bottom:1, left:1,right:1},halign: 'center',lineWidth: {right:0.2,left:0.2,bottom:0.2}}
    
    for (let i = 0; i < table_empty_count; i++) {
      var comp =i+1
      if (comp<=body.length) {
        if( body[i].q_line == 1){
          var x_1 = [
            { content: body[i].q_desc, styles: s_e1 },
            { content: body[i].q_qty, styles: s_c1 },
            { content: body[i].q_unit, styles: s_c1 },
            { content: body[i].q_price, styles: s_n1 },
            { content: body[i].q_total, styles: s_n1 }
           ]
        }else{
        var x_1 = [
          { content: body[i].q_desc, styles: s_e },
          { content: body[i].q_qty, styles: s_c },
          { content: body[i].q_unit, styles: s_c },
          { content: body[i].q_price, styles: s_n },
          { content: body[i].q_total, styles: s_n }
         ]
        }
      }else{
        var x_1 = [
          { content: '', styles: s_e },
          { content: '', styles: s_e },
          { content: '', styles: s_e },
          { content: '', styles: s_e },
          { content: '', styles: s_e }
         ]
      }
      
      data.push(x_1);
    }
    doc.autoTable({
     
      head: [[
        {
          content: "Description",
          colSpan: 1,
          rowSpan: 1,
          styles:{
            cellWidth: 60,
            fontSize:10,
            cellPadding: {top:1,bottom:1},
            halign: 'center'
          }
        },
        {
          content: "Qty",
          colSpan: 1,
          rowSpan: 1,
          styles:{
            cellWidth: 13,
            fontSize:10,
            cellPadding: {top:1,bottom:1},
            halign: 'center'
          }
        },
        {
          content: "UoM",
          colSpan: 1,
          rowSpan: 1,
          styles:{
            cellWidth: 16,
            fontSize:10,
            cellPadding: {top:1,bottom:1},
            halign: 'center'
          }
        },
        {
          content: "Unit Price",
          colSpan: 1,
          rowSpan: 1,
          styles:{
            cellWidth: 33,
            fontSize:10,
            cellPadding: {top:1,bottom:1},
            halign: 'center'
          }
        },
        {
          content: "Total",
          colSpan: 1,
          rowSpan: 1,
          styles:{
            fontSize:10,
            cellPadding: {top:1,bottom:1},
            halign: 'center'
          }
        }
      ]],
      body: data,
      startY:110,
      margin: { top: 0,bottom:0},
    })
    doc.autoTable({
    
      body:[
            [
              { 
                content: 'Payment Instruction', 
                colSpan: 3, 
                rowSpan: 1, 
                styles: { 
                  halign: 'left' ,
                  cellWidth: 15,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellPadding: {top:1,bottom:1},
                  fillColor:'white'
                } 
              }, 
              { content: 'Subtotal', 
                colSpan: 1, 
                rowSpan: 1, 
                styles: { 
                  halign: 'right' ,
                  fontSize:8,
                  fontStyle: 'bold',
                  cellWidth: 33,
                  fillColor:'white',
                  cellPadding: {top:1,bottom:1},
                }
              }, 
              { content: ' Rp.', 
                styles: { 
                  halign: 'left' ,
                  fontSize:8,
                  cellWidth: 7,
                  fillColor:'white',
                  lineColor:'black',
                  fontStyle: 'bold',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }, 
              { content: ''+fs_total+'', 
                styles: { 
                  halign: 'right' ,
                  fontSize:8,
                  cellWidth: 36,
                  fillColor:'white',
                  lineColor:'black',
                  fontStyle: 'bold',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              },
              { content: ',-', 
                styles: { 
                  halign: 'left' ,
                  fontSize:8,
                  cellWidth: 4,
                  fillColor:'white',
                  lineColor:'black',
                  fontStyle: 'bold',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }
            ],[
              { 
                content: 'Payment Method\nBank Account', 
                colSpan: 1,   
                rowSpan: 3, 
                styles: { 
                  halign: 'left' ,
                  valign: 'top',
                  cellWidth: 30,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellPadding: {top:1,bottom:1,left:2,right:2},
                  lineColor: 'black',
                  lineWidth: {top:0.1},
                  fillColor:'#F0F0F0'
                } 
              },
              { 
                content: ':\n:', 
                colSpan: 1,   
                rowSpan: 3, 
                styles: { 
                  halign: 'left' ,
                  valign: 'top',
                  cellWidth: 5,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellPadding: {top:1,bottom:1,left:2,right:2},
                  lineColor: 'black',
                  lineWidth: {top:0.1},
                  fillColor:'#F0F0F0'
                } 
              },{ 
                content: 'Bank Transfer\n'+query[0].account_bank+'\n'+query[0].account_name+'\n'+query[0].account_number+'', 
                colSpan: 1,   
                rowSpan: 3, 
                styles: { 
                  halign: 'left' ,
                  valign: 'top',
                  cellWidth: 65,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellPadding: {top:1,bottom:1,left:2,right:2},
                  lineColor: 'black',
                  lineWidth: {top:0.1},
                  fillColor:'#F0F0F0'
                } 
              },
              { content: 'Discount Rate', 
                colSpan: 1, 
                rowSpan: 1, 
                styles: { 
                  halign: 'right' ,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellWidth: 33,
                  fillColor:'white',
                  cellPadding: {top:1,bottom:1},
                }
              }, 
              { content: '', 
                styles: { 
                  halign: 'left' ,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellWidth: 7,
                  fillColor:'white',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }, 
              { content: ''+f_disc+'', 
                styles: { 
                  halign: 'right' ,
                  fontSize:8,
                  cellWidth: 36,
                  fillColor:'white',
                  fontStyle: 'bold',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              },
              { content: '%', 
                styles: { 
                  halign: 'left' ,
                  fontSize:8,
                  cellWidth: 4,
                  fillColor:'white',
                  fontStyle: 'bold',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }
            ],[
              
              { content: 'After Discount', 
                colSpan: 1, 
                rowSpan: 1, 
                styles: { 
                  halign: 'right' ,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellWidth: 33,
                  fillColor:'white',
                  cellPadding: {top:1,bottom:1},
                }
              }, 
              { content: ' Rp.', 
                styles: { 
                  halign: 'left' ,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellWidth: 7,
                  fillColor:'white',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }, 
              { content: ''+fs_after_disc+'', 
                styles: { 
                  halign: 'right' ,
                  fontSize:8,
                  cellWidth: 36,
                  fillColor:'white',
                  fontStyle: 'bold',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              },
              { content: ',-', 
                styles: { 
                  halign: 'left' ,
                  fontSize:8,
                  cellWidth: 4,
                  fillColor:'white',
                  fontStyle: 'bold',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }
            ],[
              
              { content: 'Tax Rate :', 
                colSpan: 1, 
                rowSpan: 1, 
                styles: { 
                  halign: 'right' ,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellWidth: 33,
                  fillColor:'white',
                  cellPadding: {top:1,bottom:1},
                }
              }, 
              { content: ' ', 
                styles: { 
                  halign: 'left' ,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellWidth: 7,
                  fillColor:'white',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }, 
              { content: ''+f_tax+'', 
                styles: { 
                  halign: 'right' ,
                  fontSize:8,
                  cellWidth: 36,
                  fillColor:'white',
                  fontStyle: 'bold',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              },
              { content: '%', 
                styles: { 
                  halign: 'left' ,
                  fontSize:8,
                  cellWidth: 4,
                  fillColor:'white',
                  fontStyle: 'bold',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }
            ],[
              { 
                content: 'Note', 
                colSpan: 3, 
                rowSpan: 1, 
                styles: { 
                  halign: 'left' ,
                  cellWidth: 15,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellPadding: {top:1,bottom:1},
                  fillColor:'white'
                } 
              },
              { content: 'Total Tax :', 
                colSpan: 1, 
                rowSpan: 1, 
                styles: { 
                  halign: 'right' ,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellWidth: 33,
                  fillColor:'white',
                  cellPadding: {top:1,bottom:1},
                }
              }, 
              { content: ' Rp.', 
                styles: { 
                  halign: 'left' ,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellWidth: 7,
                  fillColor:'white',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }, 
              { content: ' '+fs_total_tax+'', 
                styles: { 
                  halign: 'right' ,
                  fontSize:8,
                  cellWidth: 36,
                  fillColor:'white',
                  fontStyle: 'bold',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              },
              { content: ',-', 
                styles: { 
                  halign: 'left' ,
                  fontSize:8,
                  cellWidth: 4,
                  fillColor:'white',
                  fontStyle: 'bold',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }
            ],[
              { 
                content: '- Invoice Due Date '+formattedDate+'\n'
                          +note_inv+'', 
                colSpan: 3, 
                rowSpan: 6, 
                styles: { 
                  halign: 'left' ,
                  valign: 'top',
                  cellWidth: 15,
                  fontStyle: 'bold',
                  fontSize:8,
                  cellPadding: {top:1,bottom:1,left:2,right:2},
                  lineColor: 'black',
                  lineWidth: {top:0.1},
                  fillColor:'F0F0F0'
                }
              },
              { content: 'Total :', 
                colSpan: 1, 
                rowSpan: 1, 
                styles: { 
                  halign: 'right' ,
                  fontStyle: 'bold',
                  fontSize:11,
                  cellWidth: 33,
                  fillColor:'white',
                  cellPadding: {top:1,bottom:1},
                }
              }, 
              { content: ' Rp.', 
                styles: { 
                  halign: 'left' ,
                  fontStyle: 'bold',
                  fontSize:10,
                  cellWidth: 9,
                  fillColor:'white',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }, 
              { content: ''+fs_ammount+'', 
                styles: { 
                  halign: 'right' ,
                  fontSize:11,
                  cellWidth: 36,
                  fillColor:'white',
                  fontStyle: 'bold',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              },
              { content: ',-', 
                styles: { 
                  halign: 'left' ,
                  fontSize:11,
                  cellWidth: 4,
                  fillColor:'white',
                  fontStyle: 'bold',
                  lineColor:'black',
                  cellPadding: {top:1,bottom:1,left:1},
                  lineWidth: {bottom:0.1},
                }
              }
            ],[{content:"", colSpan:4,styles: {fillColor:'white',}}],[{content:"", colSpan:4,styles: {fillColor:'white',}}]
            
          ],

      startY:220,
      margin: { top: 0,bottom:0},
    })
    const text = "sign.renbo.co.id/token="+query[0].so_token+"";
    const logoBuffer = req.data.client_small_logo;

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H',margin: 1 });

    // Load QR code and logo images
    const qrCodeImage = await Jimp.read(Buffer.from(qrCodeDataURL.split(',')[1], 'base64'));
    const logoImage = await Jimp.read(logoBuffer);

    // Calculate logo position
    const logoSize = qrCodeImage.bitmap.width / 5;
    logoImage.resize(logoSize, logoSize);
    const x = (qrCodeImage.bitmap.width - logoSize) / 2;
    const y = (qrCodeImage.bitmap.height - logoSize) / 2;

    // Composite the logo onto the QR code
    qrCodeImage.composite(logoImage, x, y);

    // Get the final image as a base64 string in JPEG format
    const finalImageBuffer = await qrCodeImage.getBufferAsync(Jimp.MIME_JPEG);
    const finalImageBase64 = finalImageBuffer.toString('base64');
    const finalImageDataURL = `data:image/jpeg;base64,${finalImageBase64}`;

    // Add the final image to the PDF document
    doc.addImage(finalImageDataURL, 'JPEG', 170, 260, 20, 20);
    doc.setFontSize(9);
    doc.setFont("times", "italic");
    doc.text('* This document is electronically validated, please scan the qrcode to make sure that this document is valid', 12, 287)
    doc.text('* We only have one gate validation certificate on www.sign.renbo.co.id ', 12, 291)
    if(baris>16){
      doc.addPage();
      doc.addImage(imgData, 'PNG', 10,12,newHeight , newWidth);
      doc.setFontSize(20);
      doc.setFont("helvetica", "normal");
      doc.text('QUOTATION', 150, 24);
      doc.setLineWidth(20);
      doc.setDrawColor(99, 153, 67);
      doc.autoTable({
        styles: { fillColor: [99,153, 67] },
        head:[[""]],
        startY:33,
      })
      var page2_body = []
      for (let u = 0; u < subs.length; u++) {
        if (subs[u].line_type == 1){
          var desc =  subs[u].quotation_desc
          var qty = '';
          var unit  =  '';
          var g = parseInt(subs[u].group_no)-1;
          var price = ''
          var total =  totals[g].price;
        }else if(subs[u].line_type == 2){
          var desc =  subs[u].quotation_desc
          var qty = subs[u].quotation_qty
          var unit  =  subs[u].unit_desc;
          var price1 = subs[u].quotation_price * (query[0].invoice_rate/100)
          var total1 = subs[u].quotation_total * (query[0].invoice_rate/100)
          var price = parseFloat(price1).toFixed(2)
          var total =parseFloat(total1).toFixed(2)
        }else{
          var desc =  subs[u].quotation_desc
          var qty = '';
          var unit  =  '';
          var price = '';
          var total = '';
        }
        
        var data_x = {
          q_desc : desc,
          q_qty : qty,
          q_unit: unit,
          q_line: subs[u].line_type,
          q_price: String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          q_total: String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
        page2_body.push(data_x)
      }
      var page2_data = []      
      for (let i = 0; i < subs.length; i++) {
      
       
          if( page2_body[i].q_line == 1){
            var x_1 = [
              { content: page2_body[i].q_desc, styles: s_e1 },
              { content: page2_body[i].q_qty, styles: s_c1 },
              { content: page2_body[i].q_unit, styles: s_c1 },
              { content: page2_body[i].q_price, styles: s_n1 },
              { content: page2_body[i].q_total, styles: s_n1 }
            ]
          }else{
          var x_1 = [
            { content: page2_body[i].q_desc, styles: s_e },
            { content: page2_body[i].q_qty, styles: s_c },
            { content: page2_body[i].q_unit, styles: s_c },
            { content: page2_body[i].q_price, styles: s_n },
            { content: page2_body[i].q_total, styles: s_n }
          ]
          }
        
        
        page2_data.push(x_1);
      }
      doc.setFontSize(9);
      doc.text('berikut item detail dari invoice '+query[0].invoice_number+':', 15, 45);
      doc.autoTable({
     
        head: [[
          {
            content: "Description",
            colSpan: 1,
            rowSpan: 1,
            styles:{
              cellWidth: 60,
              fontSize:10,
              cellPadding: {top:1,bottom:1},
              halign: 'center'
            }
          },
          {
            content: "Qty",
            colSpan: 1,
            rowSpan: 1,
            styles:{
              cellWidth: 13,
              fontSize:10,
              cellPadding: {top:1,bottom:1},
              halign: 'center'
            }
          },
          {
            content: "UoM",
            colSpan: 1,
            rowSpan: 1,
            styles:{
              cellWidth: 16,
              fontSize:10,
              cellPadding: {top:1,bottom:1},
              halign: 'center'
            }
          },
          {
            content: "Unit Price",
            colSpan: 1,
            rowSpan: 1,
            styles:{
              cellWidth: 33,
              fontSize:10,
              cellPadding: {top:1,bottom:1},
              halign: 'center'
            }
          },
          {
            content: "Total",
            colSpan: 1,
            rowSpan: 1,
            styles:{
              fontSize:10,
              cellPadding: {top:1,bottom:1},
              halign: 'center'
            }
          }
        ]],
        body: page2_data,
        startY:50,
        margin: { top: 0,bottom:0},
      })
    }
    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=table.pdf');
    res.send(Buffer.from(pdfBuffer));

  } 
  catch (e) {
    console.log(e)
  }
}
const insertDataInv = async(req, res ) => {
  try {
      var l_quotation = await 
      knex('l_quotations').update({
        sales_id        :req.body.sales_id,
        customer_id     :req.body.customer_id,
        remark_id       :req.body.remark_id,
        quotation_tax   :req.body.quotation_tax,
        quotation_disc  :req.body.quotation_disc,
        quotation_note  :req.body.quotation_note,
        quotation_name  :req.body.quotation_name,
        quotation_date  :req.body.quotation_date,
        quotation_exp   :req.body.quotation_exp
      }).where({
        quotation_id:req.body.quotation_id
      })
      res.status(200).send(
        {
          message: "Success",
          data: l_quotation
        }
      );
  } 
  catch (e) {
      
  }
}

module.exports = { addSubInv, indexInv ,indexInvId ,createInv,updateInv,deleteInv,updateStatusInv,pdfInv,insertDataInv}