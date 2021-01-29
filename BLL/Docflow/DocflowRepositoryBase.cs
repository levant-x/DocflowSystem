using arkAS.Models;
using arkAS.Models.Docflow;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Docflow
{
    public abstract class DocflowRepositoryBase : IRepository
    {
        public abstract IQueryable<as_docStatuses> GetDocStatuses();

        public abstract IQueryable<as_docTypes> GetDocTypes();

        #region CRU for Contragents
        public abstract IQueryable<as_contragents> GetContragents();

        public abstract int ModifyContragent(as_contragents contragent);
        #endregion

        #region CRU for Shippers
        public abstract IQueryable<as_shippers> GetShippers();

        public abstract int ModifyShipper(as_shippers shipper);
        #endregion

        #region CRUD for Contract docs
        public abstract IQueryable<as_contractDocs> GetContractDocs();

        public abstract int ModifyContractDoc(as_contractDocs contractDoc);

        public abstract bool DeleteContractDoc(as_contractDocs contractDoc);
        #endregion

        #region CRUD for Shipments
        public abstract IQueryable<as_shipments> GetShipments();

        public abstract int ModifyShipment(as_shipments shipment);

        public abstract bool DeleteShipment(as_shipments shipment);
        #endregion
                        
        #region CRUD for Contract files
        public abstract IQueryable<as_contractFiles> GetContractFiles();

        public abstract int ModifyContractFile(as_contractFiles contractFile);

        public abstract bool DeleteContractFile(as_contractFiles contractFile);

        #endregion
        
        public virtual void Dispose()
        {
            
        }
    }
}