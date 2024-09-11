var express = require('express');
var router  = express.Router();
var knex    = require('../../config/connection')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { use } = require('../routes');

const cheerio = require('cheerio');

const fs = require('fs');
const { json } = require('body-parser');
const coordinat1 = async (req, res) => {
  try {
    for (let d = 0; d < 1; d++) {
      try {
          const data = fs.readFileSync(`../RENBO-ERP/data/momi/98.json`);
          const jsonData = JSON.parse(data);
  
          const features = jsonData.features;
          const insertPromises = features.map(async feature => {
              // Extracting data from the feature
              const { attributes, geometry } = feature;
              const { kode_wiup, sk_iup, objectid, pulau, pejabat, id_prov, nama_prov, id_kab, nama_kab, komoditas, kode_golongan, kode_jnskom, kode_wil } = attributes;
              const koor = geometry.rings[0];
              const koord = koor.map(coords => ({
                  x: coords[0] * (1),
                  y: coords[1] * (1)
              }));
  
              // Inserting data into the database
              await knex('coordinat').insert(
                  koord.map(coord => ({
                      kode_wiup,
                      sk_iup,
                      object_id: objectid,
                      x: coord.x,
                      y: coord.y,
                      pulau,
                      pejabat_berwenang: pejabat,
                      id_provinsi: id_prov,
                      nama_provinsi: nama_prov,
                      id_kabupaten: id_kab,
                      nama_kabupaten: nama_kab,
                      komoditas,
                      kode_komoditas: kode_golongan,
                      kode_jenis_komoditas: kode_jnskom,
                      kode_wilayah: kode_wil
                  }))
              );
          });
  
          await Promise.all(insertPromises);
          console.log(`Processed file ${d}.json`);
      } catch (error) {
          console.error("not found "+d+"");
          // Continue processing other files even if one fails
          continue;
      }
  }
  
  } catch (err) {
    console.error(`Error processing file ${d}.json:`, err);
        // Continue processing other files even if one fails
   
  }
}
const outData = async (req, res) => {
  try {

    var q = await knex('izin_perusahaan').join(
      'data_perusahaan','data_perusahaan.data_id','izin_perusahaan.data_id'
    ).where({
      nomor_perizinan : '188.44/393/DPE/2010'
    });
    var ft = [];
    for (let i = 0; i < q.length; i++) {
      var c = await knex('coordinat').where({
        sk_iup: q[i].nomor_perizinan
      })
      var co = []
      for (let i2 = 0; i2 < c.length; i2++) {
        var coor = [c[i2].x,c[i2].y]
        co.push(coor)
      }
       var feature = {
          "type" : "Feature",
          "properties" : {
            "name" : ""+q[i].jenis_badan_usaha+"."+q[i].nama_perusahaan+""
          },
          "geometry": {
            "type" : "Polygon",
            "coordinates": [co]
          },
          "id" : q[i].izin_id
       }
       ft.push(feature);
    }
    res.status(200).send({
      "type" : "FeatureCollection",
      "feature": ft
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      desc: "Database Error"
    });
  }
}
const coordinat2 = async (req, res) => {

  for (let d = 0; d < 200000; d++) {
    const url = 'https://geoportal.esdm.go.id/monaresia/sharing/servers/f71c3600a00f4dc4989fb40fe3b769d2/rest/services/Pusat/WIUP_Publish/MapServer/0/query';
    const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cookie': 'TS014b3052=01a59bdcdeaf32b3978a42e42366d1ab0e9ece959312fb0dc457119b636dba91de75f5fe5df665d40d75cadcd5e1a73d46cdc21317; TSab544faa027=085ff7edfdab200060bdd74a2dac2376550e6d449f52b0172943b8972262daab842cff6de27a26da088fa283ec113000d3c85516b36f5463912e33b0a5855fc7317bd3d2bd7a26648df663638aca510a4f26a728d9ea58f29ef9d176606668c7',
        'Host': 'geoportal.esdm.go.id',
        'Referer': 'https://geoportal.esdm.go.id/minerba/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
    };
    
    const params = {
        f: 'json',
        where: '',
        returnGeometry: true,
        spatialRel: 'esriSpatialRelIntersects',
        objectIds: d,
        outFields: '*',
        outSR: 102100,
    };

    try {
        const response = await axios.get(url, { headers, params });
        const jsonData = response.data;
        const features = jsonData.features;
          const insertPromises = features.map(async feature => {
              // Extracting data from the feature
              const { attributes, geometry } = feature;
              const { kode_wiup, sk_iup, objectid, pulau, pejabat, id_prov, nama_prov, id_kab, nama_kab, komoditas, kode_golongan, kode_jnskom, kode_wil } = attributes;
              const koor = geometry.rings[0];
              const koord = koor.map(coords => ({
                  x: coords[0] * (8.983 * 0.000001),
                  y: coords[1] * (8.983 * 0.000001)
              }));
  
              // Inserting data into the database
              await knex('coordinat').insert(
                  koord.map(coord => ({
                      kode_wiup,
                      sk_iup,
                      object_id: objectid,
                      x: coord.x,
                      y: coord.y,
                      pulau,
                      pejabat_berwenang: pejabat,
                      id_provinsi: id_prov,
                      nama_provinsi: nama_prov,
                      id_kabupaten: id_kab,
                      nama_kabupaten: nama_kab,
                      komoditas,
                      kode_komoditas: kode_golongan,
                      kode_jenis_komoditas: kode_jnskom,
                      kode_wilayah: kode_wil
                  }))
              );
          });
  
          await Promise.all(insertPromises);
          console.log(`Processed file ${d}.json`);
    
        
    } catch (error) {
        
    }
  }
}
const coordinat3 = async (req, res) => {

  for (let d = 2300; d < 8000; d += 100) {
    const url = 'https://geoportal.esdm.go.id/monaresia/sharing/servers/f71c3600a00f4dc4989fb40fe3b769d2/rest/services/Pusat/WIUP_Publish/MapServer/0/query';
    const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cookie': 'TS014b3052=01a59bdcdeaf32b3978a42e42366d1ab0e9ece959312fb0dc457119b636dba91de75f5fe5df665d40d75cadcd5e1a73d46cdc21317; TSab544faa027=085ff7edfdab200060bdd74a2dac2376550e6d449f52b0172943b8972262daab842cff6de27a26da088fa283ec113000d3c85516b36f5463912e33b0a5855fc7317bd3d2bd7a26648df663638aca510a4f26a728d9ea58f29ef9d176606668c7',
        'Host': 'geoportal.esdm.go.id',
        'Referer': 'https://geoportal.esdm.go.id/minerba/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
    };
    
    const params = {
        f: 'json',
        where: '1=1',
        returnGeometry: false,
        spatialRel: 'esriSpatialRelIntersects',
        outFields: '*',
        resultOffset: d,
        resultRecordCount: 100
    };

    try {
        const response = await axios.get(url, { headers, params });
        const data = response.data;
        console.log(data,d);
        const processedData = data.features.map(feature => {
          return {
              objectid: feature.attributes.objectid,
              pulau: feature.attributes.pulau,
              pejabat: feature.attributes.pejabat,
              id_prov: feature.attributes.id_prov,
              nama_prov: feature.attributes.nama_prov,
              id_kab: feature.attributes.id_kab,
              nama_kab: feature.attributes.nama_kab,
              jenis_izin: feature.attributes.jenis_izin,
              badan_usaha: feature.attributes.badan_usaha,
              nama_usaha: feature.attributes.nama_usaha,
              kode_wiup: feature.attributes.kode_wiup,
              sk_iup: feature.attributes.sk_iup,
              tgl_berlaku: new Date(feature.attributes.tgl_berlaku),
              tgl_akhir: new Date(feature.attributes.tgl_akhir),
              kegiatan: feature.attributes.kegiatan,
              luas_sk: feature.attributes.luas_sk,
              komoditas: feature.attributes.komoditas,
              kode_golongan: feature.attributes.kode_golongan,
              kode_jnskom: feature.attributes.kode_jnskom,
              cnc: feature.attributes.cnc,
              generasi: feature.attributes.generasi,
              kode_wil: feature.attributes.kode_wil,
              lokasi: feature.attributes.lokasi
          };
      });

      // Insert the processed data into the database
      await knex('data_wiup').insert(processedData);
          console.log(`Processed file ${d}.json`);
    
        
    } catch (error) {
        
    }
  }
}
const coordinat4 = async (req, res) => { 
  try {

    var q = await knex('data_perusahaan');
    var q1 = await knex('data_wiup');
    for (let i = 8000; i < q1.length; i++) {
      var q2 = await knex('data_perusahaan').where({
        nama_perusahaan:q1[i].nama_usaha,
        jenis_badan_usaha:q1[i].badan_usaha
      })
      if(q2.length>0){
      var q3= await knex('data_wiup').where({
        objectid:q1[i].objectid
      }).update({
        data_id:q2[0].data_id
      })
      console.log(""+i+"dari"+q1.length+"")
      }
      console.log(""+i+"dari"+q1.length+"")
    }

  } catch (err) {
    res.status(500).send({
      message: err.message,
      desc: "Database Error"
    });
  }
}
const coordinat = async (req, res) => {

  for (let d = 0; d < 2000; d += 1) {
    const url = 'https://geoportal.esdm.go.id/gis4/rest/services/bgl_bgd_tu/Potensi_Sumber_Daya_Dan_Cadangan_Batubara/MapServer/0/query';
    const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cookie': 'TS014b3052=01a59bdcdeaf32b3978a42e42366d1ab0e9ece959312fb0dc457119b636dba91de75f5fe5df665d40d75cadcd5e1a73d46cdc21317; TSab544faa027=085ff7edfdab200060bdd74a2dac2376550e6d449f52b0172943b8972262daab842cff6de27a26da088fa283ec113000d3c85516b36f5463912e33b0a5855fc7317bd3d2bd7a26648df663638aca510a4f26a728d9ea58f29ef9d176606668c7',
        'Host': 'geoportal.esdm.go.id',
        'Referer': 'https://geoportal.esdm.go.id/minerba/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
    };
    
    const params = {
        f: 'json',
        where: '1=1',
        returnGeometry: 'true',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: '*',
        orderByFields: 'objectid ASC',
        resultOffset: d,
        resultRecordCount: '1'
    };

    try {
        const response = await axios.get(url, { headers, params });
        const data = response.data;
        
        const processedData = data.features.map(feature => {
          return {
            objectid: feature.attributes.objectid,
            namobj: feature.attributes.namobj,
            sumberdata: feature.attributes.sumberdata,
            klsbb: feature.attributes.klsbb,
            kriteria: feature.attributes.kriteria,
            target_eks: feature.attributes.target_eks,
            tereka: feature.attributes.tereka,
            tertunjuk: feature.attributes.tertunjuk,
            terukur: feature.attributes.terukur,
            total_sd: feature.attributes.total_sd,
            terkira: feature.attributes.terkira,
            terbukti: feature.attributes.terbukti,
            total_cada: feature.attributes.total_cada,
            sumber_lap: feature.attributes.sumber_lap,
            acuan: feature.attributes.acuan,
            update_: feature.attributes.update_,
            statdikbb: feature.attributes.statdikbb,
            idinstansi: feature.attributes.idinstansi,
            kabupaten: feature.attributes.kabupaten,
            remark: feature.attributes.remark,
            status: feature.attributes.status,
            longitude: feature.geometry.x,
            latitude: feature.geometry.y
          };
        });
    
        // Insert the processed data into the database
        await knex('cadangan_batubara').insert(processedData);
        
        console.log(d);
    
        
    } catch (error) {
        
    }
  }
}

module.exports = {coordinat,outData};

// const getData = async(req, res ) => {
    //   try {
    //     var page = req.body.page;
    //     console.log(req.params);
    //     const response = await fetch('https://modi.esdm.go.id/portal/dataPerusahaan?page='+page+'');
    //     const body = await response.text();

    //     const $ = cheerio.load(body);

    //     const headers = [];
    //     $('#tb_basic thead tr th').each((index, element) => {
    //       headers.push($(element).text().trim().replace(/[\s./%&@!#^*()+=\[\]{}|\\;:'",<>?~`-]/g, ''));
    //     });

    //     const tableData = [];
    //     $('#tb_basic tbody tr').each((index, element) => {
    //       const row = {};
    //       $(element).find('td').each((i, el) => {
    //         // Extract the text content
    //         const textContent = $(el).text().trim();

    //         // Check if the element contains an anchor tag
    //         const anchorTag = $(el).find('a');
    //         if (anchorTag.length > 0) {
    //           const link = anchorTag.attr('href');
    //           row[headers[i]] = textContent;
    //           row[`${headers[i]}_link`] = link; // Add a new key for the link
    //         } else {
    //           row[headers[i]] = textContent;
    //         }
    //       });
    //       if (Object.keys(row).length > 3) {
    //         tableData.push(row);
    //       }
    //     });

    //     res.status(200).send({
    //       message: 'Success',
    //       desc: '',
    //       data: tableData
    //     });
        
    //   } 
    //   catch (e) {
    //     res.status(404).send({
    //       message: "Error",
    //       desc: "Database Error",
    //       data: null
    //      })
    //   }
    // }
    // const getDataDetail = async(req, res ) => {
    //   try {
    //     var page = req.body.page;
    //     console.log(req.params);
    //     const response = await fetch('https://modi.esdm.go.id/portal/detailPerusahaan/14357?jp=1');
    //     const body = await response.text();

    //     const $ = cheerio.load(body);

    //     const tableData = [];
    //     var ri = 0
    //     var ro = 0
    //     const headers = ['KodePerusahaan','NamaPerusahaan','JenisBadanUsaha','NoAkte','TglAkte']
    //     $('#profile tbody tr').each((index, element) => {
    //       const row = {};
    //       $(element).find('td').each((i, el) => {
    //           ri = ri + 1;
    //           var data = $(el).text().trim();
    //           if(ri<=10 && ri > 0){
    //             if(data !== ':' ){
                
    //               row[headers[ro]] = $(el).text().trim();
    //               ro++
    //             }
    //           }
    //           if (Object.keys(row).length > 0) {
    //                 tableData.push(row);
    //           }
    //       });
    //     })
    //     const headers1 = [];
    //     $('#profile .table-responsive').each((index, element) => {
    //         var h1 = []
    //         $(element).find('th').each((i, el) => {
    //           h1.push($(el).text().trim().replace(/[\s./%&@!#^*()+=\[\]{}|\\;:'",<>?~`-]/g, ''));
    //         })
    //         headers1.push(h1);
    //     });
    
    //     const tableData1 = [];
    //     $('#profile .table-responsive').each((index, element) => {
    //       var r1 = []
    //         $(element).find('tr').each((i, el) => {
    //           var r2 = {}
    //           $(el).find('td').each((i1, el1) => {
    //             r2[headers1[index][i1]] = $(el1).text().trim();
    //           });
            
    //           if (Object.keys(r2).length > 0) {
    //             r1.push(r2)
    //           }
    //         })
    //         tableData1.push(r1);
    //     });

    //     const headers2 = [];
    //     $('#alamat .table-responsive').each((index, element) => {
    //         var h1 = []
    //         $(element).find('th').each((i, el) => {
    //           h1.push($(el).text().trim().replace(/[\s./%&@!#^*()+=\[\]{}|\\;:'",<>?~`-]/g, ''));
    //         })
    //         headers2.push(h1);
    //     });
    
    //     const tableData2 = [];
    //     $('#alamat .table-responsive').each((index, element) => {
    //       var r1 = []
    //       var h5 = $(element).find('h5').text().trim();
    //       var r3 = []
    //         $(element).find('tr').each((i, el) => {
    //           var r2 = {}
            
    //           $(el).find('td').each((i1, el1) => {
    //             r2[headers2[index][i1]] = $(el1).text().trim();
    //           });
            
    //           if (Object.keys(r2).length > 0) {
    //             r3.push(r2)
    //           }
    //         })
    //         r1 = {
    //           "header" : h5,
    //           "data" : r3
    //         }
    //         tableData2.push(r1);
    //     });

    //     const headers3 = [];
    //     $('#direksi .table-responsive').each((index, element) => {
    //         var h1 = []
    //         $(element).find('th').each((i, el) => {
    //           h1.push($(el).text().trim().replace(/[\s./%&@!#^*()+=\[\]{}|\\;:'",<>?~`-]/g, ''));
    //         })
    //         headers3.push(h1);
    //     });
    
    //     const tableData3 = [];
    //     $('#direksi .table-responsive').each((index, element) => {
    //       var r1 = []
    //       var h5 = $(element).find('h5').text().trim();
    //       var r3 = []
    //         $(element).find('tr').each((i, el) => {
    //           var r2 = {}
            
    //           $(el).find('td').each((i1, el1) => {
    //             r2[headers3[index][i1]] = $(el1).text().trim();
    //           });
            
    //           if (Object.keys(r2).length > 0) {
    //             r3.push(r2)
    //           }
    //         })
    //         r1 = {
    //           "header" : h5,
    //           "data" : r3
    //         }
    //         tableData3.push(r1);
    //     });
    //     const headers4 = [];
    //     $('#perizinan .table-responsive').each((index, element) => {
    //         var h1 = []
    //         $(element).find('th').each((i, el) => {
    //           h1.push($(el).text().trim().replace(/[\s./%&@!#^*()+=\[\]{}|\\;:'",<>?~`-]/g, ''));
    //         })
    //         headers4.push(h1);
    //     });
    
    //     const tableData4 = [];
    //     $('#perizinan .table-responsive').each((index, element) => {
    //       var r1 = []
    //       var r3 = []
    //         $(element).find('tr').each((i, el) => {
    //           var r2 = {}
            
    //           $(el).find('td').each((i1, el1) => {
    //             r2[headers4[index][i1]] = $(el1).text().trim();
    //           });
            
    //           if (Object.keys(r2).length > 0) {
    //             r1.push(r2)
    //           }
    //         })
    //         tableData4.push(r1);
    //     });
        

    //     res.status(200).send({
    //       message: 'Success',
    //       desc: '',
    //       profilePerusahaan: tableData, 
    //       alamatPerusahaan: tableData1[0], 
    //       pemegangSaham: tableData1[1], 
    //       susunanDireksi: tableData1[2], 
    //       npwpPerusahaan:tableData1[3],
    //       tableAlamat:tableData2,
    //       tableDireksi:tableData3,
    //       tableIzin:tableData4
    //     });
        
    //   } 
    //   catch (e) {
    //     res.status(404).send({
    //       message: "Error",
    //       desc: "Database Error",
    //       data: null
    //      })
    //   }
    // }

    // const exportData = async(req, res ) => {
    //   try {
    //     for (let loop = 359; loop < 396; loop++) {
    //       var page = loop;
    //       const response = await fetch('https://modi.esdm.go.id/portal/dataPerusahaan?page='+page+'');
    //       const body = await response.text();

    //       const $ = cheerio.load(body);

    //       const headers = [];
    //       $('#tb_basic thead tr th').each((index, element) => {
    //         headers.push($(element).text().trim().replace(/[\s./%&@!#^*()+=\[\]{}|\\;:'",<>?~`-]/g, ''));
    //       });

    //       const tableData = [];
    //       $('#tb_basic tbody tr').each((index, element) => {
    //         const row = {};
    //         $(element).find('td').each((i, el) => {
    //           // Extract the text content
    //           const textContent = $(el).text().trim();

    //           // Check if the element contains an anchor tag
    //           const anchorTag = $(el).find('a');
    //           if (anchorTag.length > 0) {
    //             const link = anchorTag.attr('href');
    //             row[headers[i]] = textContent;
    //             row[`${headers[i]}_link`] = link; // Add a new key for the link
    //           } else {
    //             row[headers[i]] = textContent;
    //           }
    //         });
    //         if (Object.keys(row).length > 3) {
    //           tableData.push(row);
    //         }
    //       });

    //       for (let i = 0; i < tableData.length; i++) {
    //         const response1 = await fetch(tableData[i].NamaPerusahaan_link);
    //         const body1 = await response1.text();
    //         var id = tableData[i].No
    //         const $1 = cheerio.load(body1);
    //         const headers3 = [];
    //         const tableData3 = [];
    //         $1('#direksi .table-responsive').each((index, element) => {
    //             var h1 = []
    //             $1(element).find('th').each((i, el) => {
    //               h1.push($1(el).text().trim().replace(/[\s./%&@!#^*()+=\[\]{}|\\;:'",<>?~`-]/g, ''));
    //             })
    //             headers3.push(h1);
    //         });
    //         $1('#direksi .table-responsive').each((index, element) => {
    //           var r1 = []
    //           var h5 = $(element).find('h5').text().trim();
    //           var r3 = []
    //           $1(element).find('tr').each((i, el) => {
    //               var r2 = {}
    //               $1(el).find('td').each((i1, el1) => {
    //                 r2[headers3[index][i1]] = $1(el1).text().trim();
    //               }); 
    //               if (Object.keys(r2).length > 0) {
    //                 r2['header'] = h5
    //                 r2['hirarki'] = index
    //                 r2['data_id'] = id
    //                 r1.push(r2)
    //               }
    //           })
    //           tableData3.push(r1)
    //         });
    //         const headers4 = [];
    //         const tableData4 = [];
    //         $1('#alamat .table-responsive').each((index, element) => {
    //             var h1 = []
    //             $1(element).find('th').each((i, el) => {
    //               h1.push($1(el).text().trim().replace(/[\s./%&@!#^*()+=\[\]{}|\\;:'",<>?~`-]/g, ''));
    //             })
    //             headers4.push(h1);
    //         });
    //         $1('#alamat .table-responsive').each((index, element) => {
    //           var r1 = []
    //           var h5 = $(element).find('h5').text().trim();
    //           var r3 = []
    //           $1(element).find('tr').each((i, el) => {
    //               var r2 = {}
    //               $1(el).find('td').each((i1, el1) => {
    //                 r2[headers4[index][i1]] = $1(el1).text().trim();
    //               }); 
    //               if (Object.keys(r2).length > 0) {
    //                 r2['header'] = h5
    //                 r2['hirarki'] = index
    //                 r2['data_id'] = id
    //                 r1.push(r2)
    //               }
    //           })
    //           tableData4.push(r1)
    //         });

    //         const headers5 = [];
    //         const tableData5 = [];
    //         $1('#perizinan .table-responsive').each((index, element) => {
    //             var h1 = []
    //             $1(element).find('th').each((i, el) => {
    //               h1.push($1(el).text().trim().replace(/[\s./%&@!#^*()+=\[\]{}|\\;:'",<>?~`-]/g, ''));
    //             })
    //             headers5.push(h1);
    //         });
    //         $1('#perizinan .table-responsive').each((index, element) => {
    //           var r1 = []
    //           var r3 = []
    //           $1(element).find('tr').each((i, el) => {
    //               var r2 = {}
    //               $1(el).find('td').each((i1, el1) => {
    //                 r2[headers5[index][i1]] = $1(el1).text().trim();
    //               }); 
    //               if (Object.keys(r2).length > 0) {
    //                 r2['data_id'] = id
    //                 r1.push(r2)
    //               }
    //           })
    //           tableData5.push(r1)
    //         });

    //         const headers1 = [];
    //         const tableData1 = [];
    //         $1('#profile .table-responsive').each((index, element) => {
    //             var h1 = []
    //             $1(element).find('th').each((i, el) => {
    //               h1.push($(el).text().trim().replace(/[\s./%&@!#^*()+=\[\]{}|\\;:'",<>?~`-]/g, ''));
    //             })
    //             headers1.push(h1);
    //         });
        
    //         $1('#profile .table-responsive').each((index, element) => {
    //           var r1 = []
    //             $1(element).find('tr').each((i, el) => {
    //               var r2 = {}
    //               $1(el).find('td').each((i1, el1) => {
                    
    //                 r2[headers1[index][i1]] = $1(el1).text().trim();
    //               });
                
    //               if (Object.keys(r2).length > 1) {
    //                 r2['data_id'] = id
    //                 r1.push(r2)
    //               }
    //             })
    //             tableData1.push(r1);
    //         });

    //         const tableData2 = [];
    //         var ri = 0
    //         var ro = 0
    //         const headers2 = ['KodePerusahaan','NamaPerusahaan','JenisBadanUsaha','NoAkte','TglAkte']
            
    //         $1('#profile tbody tr').each((index, element) => {
    //           const row = {};
    //           $1(element).find('td').each((i, el) => {
    //               ri = ri + 1;
    //               var data = $1(el).text().trim();
    //               if(ri<=10 && ri > 0){
    //                 if(data !== ':' ){
    //                   row[headers2[ro]] = $1(el).text().trim();
    //                   ro++
    //                 }
    //               }
    //               if (Object.keys(row).length > 0) {
    //                     tableData2.push(row);
    //               }
    //           });
    //         })


    //         // for (let i = 0; i < tableData3.length; i++) {
    //         //   if (tableData3.length>0) { 
    //         //     for (let i1 = 0; i1 < tableData3[i].length; i1++) {
    //         //       var q1 = await knex('direksi_perusahaan').insert({
    //         //         nama: tableData3[i][i1].Nama,
    //         //         jabatan: tableData3[i][i1].Jabatan,
    //         //         periode: tableData3[i][i1].Periode,
    //         //         header: tableData3[i][i1].header,
    //         //         data_id: tableData3[i][i1].data_id,
    //         //         hirarki: tableData3[i][i1].hirarki
    //         //       })
    //         //     }
    //         //   }       
    //         // }
    //         // for (let i = 0; i < tableData4.length; i++) {
    //         //   if (tableData4.length>0) { 
    //         //     for (let i1 = 0; i1 < tableData4[i].length; i1++) {
    //         //       var q2 = await knex('alamat_perusahaan').insert({
    //         //         peruntukan_alamat: tableData4[i][i1].PeruntukanAlamat,
    //         //         alamat: tableData4[i][i1].Alamat,
    //         //         header: tableData4[i][i1].header,
    //         //         data_id: tableData4[i][i1].data_id,
    //         //         hirarki: tableData4[i][i1].hirarki
    //         //       })
    //         //     }
    //         //   }       
    //         // }
    //         // for (let i = 0; i < tableData5.length; i++) {
    //         //   if (tableData5.length>0) { 
    //         //     for (let i1 = 0; i1 < tableData5[i].length; i1++) {
    //         //       var q3 = await knex('izin_perusahaan').insert({
    //         //         jenis_perizinan: tableData5[i][i1].JenisPerizinan,
    //         //         nomor_perizinan: tableData5[i][i1].NomorPerizinan,
    //         //         tahapan_kegiatan: tableData5[i][i1].TahapanKegiatan,
    //         //         kode_wiup: tableData5[i][i1].KodeWiup,
    //         //         komoditas: tableData5[i][i1].Komodita,
    //         //         luas_ha: tableData5[i][i1].Luasha,
    //         //         tgl_mulai_berlaku: tableData5[i][i1].TglMulaiBerlaku,
    //         //         tgl_berakhir: tableData5[i][i1].TglBerakhir,
    //         //         tahapan_cnc: tableData5[i][i1].TahapanCNC,
    //         //         lokasi: tableData5[i][i1].Lokasi,
    //         //         data_id: tableData5[i][i1].data_id
    //         //       })
    //         //     }
    //         //   }       
    //         // }
    //         for (let i = 0; i < tableData1[1].length; i++) {
    //           if (tableData1[1][i]!== undefined) { 
    //             var q4 = await knex('saham_perusahaan').insert({
    //               jenis: tableData1[1][i].Jenis,
    //               nama: tableData1[1][i].Nama,
    //               asal_negara: tableData1[1][i].AsalNegara,
    //               presentase: tableData1[1][i].Persentase,
    //               keterangan: tableData1[1][i].Keterangan,
    //               data_id: tableData1[1][i].data_id,
    //             })
    //           }       
    //         }
    //         // for (let i = 0; i < tableData1[3].length; i++) {
    //         //   if (tableData1[3][i]!== undefined) { 
    //         //     var q5 = await knex('npwp_perusahaan').insert({
    //         //       nomor_npwp: tableData1[3][i].NomorNPWP,
    //         //       nama_npwp: tableData1[3][i].NamaNPWP,
    //         //       alamat_npwp: tableData1[3][i].AlamatNPWP,
    //         //       dokumen_npwp: tableData1[3][i].DokumenNPWP,
    //         //       keterangan: tableData1[3][i].Keterangan,
    //         //       data_id: tableData1[3][i].data_id,
    //         //     })
    //         //   }       
    //         // }
    //         // var query = await knex('data_perusahaan').insert({
    //         //   nama_perusahaan: tableData[i].NamaPerusahaan,
    //         //   nomor_akte: tableData[i].NomorAkte,
    //         //   tanggal_akte: tableData[i].TanggalAkte,
    //         //   jenis_perizinan: tableData[i].JenisPerizinan,
    //         //   kode_perusahaan: tableData2[0].KodePerusahaan,
    //         //   jenis_badan_usaha: tableData2[2].JenisBadanUsaha,
    //         // })
    //         console.log(loop)
    //       }
    //     }
    //     res.status(200).send({
    //       message: 'Success',
    //       desc: '',
    //       data: tableData
    //     });
        
        
    //   } 
    //   catch (e) {
    //     res.status(404).send({
    //       message: "Error",
    //       desc: "Database Error",
    //       data: null
    //      })
    //   }
// }
module.exports = { coordinat}