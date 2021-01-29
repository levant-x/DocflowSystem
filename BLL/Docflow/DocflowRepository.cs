using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using arkAS.Models;
using Dapper;
using DapperExtensions;

namespace arkAS.Docflow
{
    public class DocflowRepository : DocflowRepositoryBase
    {
        #region Contragents
        public override IQueryable<as_contragents> GetContragents()
        {
            var res = GetItems((SqlConnection conn) =>
            {
                var coll = conn.GetList<as_contragents>();
                return coll;
            });
            return res;
        }

        public override int ModifyContragent(as_contragents contragent)
        {
            var res = GetOrCreate(contragent, (as_contragents toModify) =>
            {
                SetOnesPropValuesToAnother(contragent, toModify);
                return toModify.id;
            });
            return res;
        }
        #endregion

        #region Statuses, types
        public override IQueryable<as_docStatuses> GetDocStatuses()
        {
            var res = GetItems((SqlConnection conn) =>
            {
                return conn.GetList<as_docStatuses>();
            });
            return res;
        }

        public override IQueryable<as_docTypes> GetDocTypes()
        {
            var res = GetItems((SqlConnection conn) =>
            {
                return conn.GetList<as_docTypes>();
            });
            return res;
        }

        #endregion
        
        #region Shippers
        public override IQueryable<as_shippers> GetShippers()
        {
            var res = GetItems((SqlConnection conn) =>
            {
                return conn.GetList<as_shippers>();
            });
            return res;
        }

        public override int ModifyShipper(as_shippers shipper)
        {
            var res = GetOrCreate(shipper, (as_shippers toModify) =>
            {
                SetOnesPropValuesToAnother(shipper, toModify);
                return toModify.id;
            });
            return res;
        }
        #endregion

        #region Shipments
        public override IQueryable<as_shipments> GetShipments()
        {
            return GetItems((SqlConnection conn) =>
            {
                var list = conn.Query<as_shipments, as_shippers, as_docStatuses,
                    as_shipments>("GetShipments",
                    (shipment, shipper, status) =>
                    {
                        shipment.as_docStatus = status;
                        shipment.as_shipper = shipper;
                        return shipment;
                    });
                return list;
            });
        }

        public override int ModifyShipment(as_shipments shipment)
        {
            var res = GetOrCreate(shipment, (as_shipments toModify) =>
            {
                SetOnesPropValuesToAnother(shipment, toModify);
                toModify.as_shipper = GetShippers().First(shipper
                    => shipper.id == toModify.shipperID);
                toModify.as_docStatus = GetDocStatuses().First(status
                    => status.id == toModify.statusID);
                return toModify.id;
            });
            return res;
        }

        public override bool DeleteShipment(as_shipments shipment)
        {
            return Delete(shipment);
        }
        #endregion

        #region Contract files
        public override IQueryable<as_contractFiles> GetContractFiles()
        {
            return GetItems((SqlConnection conn) =>
            {
                return conn.GetList<as_contractFiles>();
            });
        }

        public override int ModifyContractFile(as_contractFiles contractFile)
        {
            return GetOrCreate(contractFile, (as_contractFiles toModify) =>
            {
                SetOnesPropValuesToAnother(contractFile, toModify);
                return toModify.id;
            });
        }

        public override bool DeleteContractFile(as_contractFiles contractFile)
        {
            var res = Delete(contractFile);
            if (res)
            {
                var owner = GetContractDocs().FirstOrDefault(doc 
                    => doc.as_contractFile.id == contractFile.id);
                if (owner != null) owner.as_contractFile = null;
            }
            return res;
        }
        #endregion

        #region Contract docs
        public override IQueryable<as_contractDocs> GetContractDocs()
        {
            return GetItems((SqlConnection conn) =>
            {
                var list = conn.Query<as_contractDocs, as_contractFiles, as_docStatuses,
                    as_docTypes, as_docBasics, as_contragents, as_contractDocs>(
                    "GetContractDocs",
                    (doc, file, status, type, basic, contragent) =>
                    {
                        doc.as_contractFile = file ?? new as_contractFiles();
                        doc.as_docStatus = status;
                        doc.as_docType = type;
                        doc.as_docBasic = basic;
                        doc.as_docBasic.as_contragent = contragent;
                        return doc;
                    });
                return list;
            });
        }

        public override bool DeleteContractDoc(as_contractDocs contractDoc)
        {
            var res = Delete(contractDoc);
            if (res)
            {
                var others = GetItems((SqlConnection conn)
                    => conn.GetList<as_contractDocs>().AsQueryable())
                    .Cast<as_contractDocs>()
                    .Count(doc => doc.docBasicID == contractDoc.docBasicID);
                if (others == 0) Delete(contractDoc.as_docBasic);
            }
            return res;
        }

        public override int ModifyContractDoc(as_contractDocs contractDoc)
        {
            var currentBasic = GetDocBasics().FirstOrDefault(basic
                => contractDoc.as_docBasic.date == basic.date &&
                contractDoc.as_docBasic.contragentID == basic.contragentID);

            if (currentBasic != null) contractDoc.docBasicID = currentBasic.id;
            else contractDoc.docBasicID = GetOrCreate(contractDoc.as_docBasic,
                (as_docBasics basic) =>
                {
                    basic = contractDoc.as_docBasic;
                    return basic.id;
                });
            var res = GetOrCreate(contractDoc, (as_contractDocs toModify) =>
            {
                var guid = Guid.NewGuid().ToString().Replace("-", null);
                toModify.code = guid.Substring(0, 10);
                SetOnesPropValuesToAnother(contractDoc, toModify);
                return toModify.id;
            });
                        
            if (string.IsNullOrEmpty(contractDoc.as_contractFile?.link))
                DeleteContractFile(contractDoc.as_contractFile);
            else
            {
                contractDoc.as_contractFile.contractDocID = contractDoc.id;
                GetOrCreate(contractDoc.as_contractFile, (as_contractFiles file) => 0);
            }
            return res;
        }
        #endregion





        private IQueryable<as_docBasics> GetDocBasics()
        {
            return GetItems((SqlConnection conn) => conn.GetList<as_docBasics>());
        }
               

        private IQueryable<T> GetItems<T>(Func<SqlConnection, IEnumerable<T>> action)
        {
            var connStr = ConfigurationManager.ConnectionStrings["DataModel"]
                .ConnectionString;
            IQueryable<T> res = null;
            var conn = new SqlConnection(connStr);
            conn.Open();
            var enumRes = action(conn);
            conn.Close();
            res = enumRes.AsQueryable();
            return res;
        }

        private int GetOrCreate<T>(T item, Func<T, int> action) where T : class
        {
            var connStr = ConfigurationManager.ConnectionStrings["DataModel"]
                   .ConnectionString;
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                var target = conn.Get<T>(DataHelper.GetValByRefl(item, "id"));
                int res;
                if (target == null)
                {
                    conn.Insert(item);
                    target = item;
                    res = action(target);
                }
                else
                {
                    res = action(target);
                    conn.Update(target);
                }
                return res;
            }
        }

        private bool Delete<T>(T item) where T : class
        {
            var connStr = ConfigurationManager.ConnectionStrings["DataModel"]
                   .ConnectionString;
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                var target = conn.Get<T>(DataHelper.GetValByRefl(item, "id"));
                if (target == null) return false;
                return conn.Delete(target);
            }
        }

        private void SetOnesPropValuesToAnother(object source, object target)
        {
            foreach (var prop in source.GetType().GetProperties())
            {
                var sourceValue = DataHelper.GetValByRefl(source, prop.Name);
                if (prop.Name == "id") continue;
                else if (prop.PropertyType.IsClass && prop.PropertyType != typeof(string))
                {
                    var nestedTarget = DataHelper.GetValByRefl(target, prop.Name);
                    SetOnesPropValuesToAnother(sourceValue, nestedTarget);
                }
                else DataHelper.TrySetValByRefl(target, prop.Name, sourceValue); 
            }
        }
    }
}