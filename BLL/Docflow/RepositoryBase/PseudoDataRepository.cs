using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web;
using System.Xml.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.ComponentModel;
using arkAS.Models;
using arkAS.Docflow;
using Glimpse.AspNet.Tab;
using System.Runtime.Serialization;

namespace arkAS.DAL
{
    public class PseudoDataRepository : DocflowRepositoryBase
    {
        private List<as_contractDocs> _contractDocs = new List<as_contractDocs>();
        private List<as_contractFiles> _contractFiles = new List<as_contractFiles>();
        private List<as_contragents> _contragents = new List<as_contragents>();
        private List<as_docBasics> _docBasics = new List<as_docBasics>();
        private List<as_docStatuses> _docStatuses = new List<as_docStatuses>();
        private List<as_docTypes> _docTypes = new List<as_docTypes>();
        private List<as_shipments> _shipments = new List<as_shipments>();
        private List<as_shippers> _shippers = new List<as_shippers>();

        private FieldInfo[] thisFields;
        private Random _rnd = new Random();
        private bool regenerate = false;
        private Stream stream;
        private string _PATH;

        public PseudoDataRepository()
        {
            _PATH = HttpContext.Current.Server.MapPath("~/App_Data/pseudo_data.bin");
            thisFields = GetType().GetFields(BindingFlags.NonPublic |
                BindingFlags.Instance);
            if (LoadBin()) return;
            else regenerate = true;

            GenerateSomeItems(_contragents);
            GenerateSomeItems(_shippers);
            _docStatuses.AddRange(new as_docStatuses[]
            {
                new as_docStatuses() { id = 1, name = "Новый"},
                new as_docStatuses() { id = 2, name = "На согласовании"},
                new as_docStatuses() { id = 3, name = "Выставлен"},
                new as_docStatuses() { id = 4, name = "Утвержден"},
                new as_docStatuses() { id = 5, name = "Закрыт"}
            });
            _docTypes.AddRange(new as_docTypes[]
            {
                new as_docTypes() { id = 1, name = "Акт"},
                new as_docTypes() { id = 2, name = "Договор"},
                new as_docTypes() { id = 3, name = "Доп. соглашение"},
                new as_docTypes() { id = 4, name = "Счет"}
            });
            GenerateSomeItems(_docBasics, 20, 20);
            GenerateSomeItems(_contractDocs, 40, 40);
            GenerateSomeItems(_contractFiles, 35, 35);
            GenerateSomeItems(_shipments);

            if (regenerate) SaveBin();
        }

        private void GenerateSomeItems<T>(IList<T> list, int min = 10, int max = 100)
        {
            var num = _rnd.Next(min, max);
            for (int i = 0; i < num; i++)
            {
                list.Add(GenerateItem(list));
            }
        }

        private T GenerateItem<T>(IList<T> owner)
        {
            int id = 0;
            T res = (T)Activator.CreateInstance(typeof(T));
            if (owner != null)
            {
                id = GetMaxID(owner) + 1;
                SetID(res, id);
            }
            var tProps = typeof(T).GetProperties();

            foreach (var prop in tProps)
            {
                object value = null;
                if (!prop.CanWrite || prop.Name.ToLower() == "id")
                {
                    continue;
                }                                
                else if (prop.PropertyType.IsValueType)
                {
                    if (prop.Name.ToLower().Contains("id"))
                    {
                        if (prop.Name == "contractFileID" &&
                            (res as as_contractDocs).typeID != 2) continue;
                        else if (prop.Name == "typeID")
                        {
                            value = (_contractDocs.Count + 4) % 4 + 1;
                        }
                        else value = FindRandomParent(res, prop);
                    }
                    else if (prop.PropertyType.Name == "DateTime")
                    {
                        var daysOffcet = _rnd.Next(0, 100);
                        var pow = _rnd.Next(0, 50);
                        value = DateTime.Now.AddDays(Math.Pow(-1, pow) *daysOffcet);
                    }
                    else if (prop.PropertyType.Name.Contains("Nullable"))
                    {
                        value = TypeDescriptor.GetConverter(prop.PropertyType)
                            .ConvertFrom(_rnd.NextDouble() * _rnd.Next(10, 10000));
                    }
                    else if (!prop.PropertyType.Name.Contains("Nullable"))
                    {
                        value = _rnd.Next() * _rnd.Next(-1000, 1000);
                    }
                } 

                else if (prop.PropertyType.Name == "String")
                {
                    string chars = "qwerrtuyiopasdfghkjlzxcvbn,m.;1234567890-" +
                        "йцукенгшщзхъфывапролджэячсмитьбю";
                    var someText = new StringBuilder();
                    var arr = chars.Select(ch => (object)ch).ToArray();
                    for (int i = 0; i < _rnd.Next(10, 20); i++)
                    {
                        someText.Append(GetRandomElement(arr));
                    }
                    value = someText.ToString();
                }
                prop.SetValue(res, value);
            }
            return res;
        }

        private int GetMaxID<T>(ICollection<T> list)
        {
            if (list.Count == 0)
            {
                return 0;
            }
            return list.Max(arg => GetID(arg));
        }

        private int FindRandomParent<T>(T item, PropertyInfo fk)
        {
            string nameFrgm = fk.Name.ToLower().Replace("id", null);
            var parentCollecField = GetCollField(nameFrgm);
            var parentCollec = parentCollecField.GetValue(this);
            var count = (int)parentCollec.GetType().GetProperty("Count")
                .GetValue(parentCollec);
            var list = new List<object>();            
            for (int i = 0; i < count; i++)
            {
                var pos = parentCollec.GetType().GetProperty("Item")
                    .GetValue(parentCollec, new object[] { i });
                list.Add(pos);
            }
            var parent = GetRandomElement(list.ToArray());
            return GetID(parent);
        }

        private FieldInfo GetCollField(string name)
        {
            return thisFields.FirstOrDefault(field
                => field.FieldType.GenericTypeArguments[0].Name
                .ToLower().Contains(name));
        }

        private object GetRandomElement(object[] array)
        {
            return array[_rnd.Next(0, array.Length - 1)];
        }

        #region Refliction test methods
        private int AddOrModify<T>(ICollection<T> list, T item)
        {
            if (item == null)
            {
                return -1;
            }

            int id = GetID(item);
            var predicate = new Func<T, bool>((arg) => GetID(arg) == id);
            var existingItem = list.FirstOrDefault(predicate);

            if (existingItem == null)
            {
                id = GetMaxID(list) + 1;
                SetID(item, id);
                list.Add(item);
            }
            else if (existingItem.Equals(item)) return id;
            else EqualizeValues(existingItem, item);
            return id;
        }

        private void EqualizeValues(object existingItem, object newItem)
        {
            var exiItemType = existingItem.GetType();
            foreach (var prop in newItem.GetType().GetProperties())
            {
                if (prop.Name == "id") continue;

                var exiItemProp = exiItemType.GetProperty(prop.Name);
                var oldValue = exiItemProp.GetValue(existingItem);
                var newValue = prop.GetValue(newItem);

                if (oldValue.Equals(newValue)) continue;
                try
                {
                    exiItemProp.SetValue(existingItem, newValue);
                }
                catch (Exception e) { }
            }
        }

        private object GetValue(object item, string propName)
        {
            return item.GetType().GetProperty(propName).GetValue(item);
        }

        private int GetID(object arg)
        {
            var id = GetValue(arg, "id");
            return Convert.ToInt32(id);
        }

        private void SetID(object arg, int id)
        {
            arg.GetType().InvokeMember("id", BindingFlags.SetProperty, null, arg,
                new object[] { id });
        }
        #endregion
                
        private as_docBasics DocBasics(as_contractDocs doc)
        {
            var res = _docBasics.FirstOrDefault(basic => basic.id == doc.docBasicID);
            if (res == null) return res;
            res.as_contragent = _contragents.FirstOrDefault(ctrg => ctrg.id == res.contragentID);
            return res;
        }

        public override IQueryable<as_contractDocs> GetContractDocs()
        {
            if (_contractDocs.Any(contractDoc => contractDoc.as_docBasic == null ||
            contractDoc.as_docStatus == null || contractDoc.as_docType == null ||
            contractDoc.as_contractFile == null))
                _contractDocs.ForEach(doc =>
                {
                    doc.as_contractFile = _contractFiles.FirstOrDefault(file
                        => file.contractDocID == doc.id) ?? new as_contractFiles();
                    doc.as_docBasic = DocBasics(doc);
                    doc.as_docStatus = _docStatuses.First(status
                        => status.id == doc.statusID);
                    doc.as_docType = _docTypes.First(docType
                        => docType.id == doc.typeID);
                });
            return _contractDocs.AsQueryable();
        }

        public override IQueryable<as_contractFiles> GetContractFiles()
        {
            return _contractFiles.AsQueryable();
        }

        public override IQueryable<as_docStatuses> GetDocStatuses()
        {
            return _docStatuses.AsQueryable();
        }

        public override IQueryable<as_contragents> GetContragents()
        {
            return _contragents.AsQueryable();
        }

        public override bool DeleteContractDoc(as_contractDocs contractDoc)
        {            
            if (_contractFiles.FirstOrDefault(file => file.contractDocID == contractDoc.id)
                is as_contractFiles linkedFile)
            {
                _contractFiles.Remove(linkedFile);
            }
            return _contractDocs.Remove(contractDoc);
        }

        public override bool DeleteContractFile(as_contractFiles contractFile)
        {
            return _contractFiles.Remove(contractFile);
        }

        public override bool DeleteShipment(as_shipments shipment)
        {
            return _shipments.Remove(shipment);
        }

        public override IQueryable<as_docTypes> GetDocTypes()
        {
            return _docTypes.AsQueryable();
        }

        public override int ModifyContractDoc(as_contractDocs contractDoc)
        {
            int id = AddOrModify(_contractDocs, contractDoc);
            var existingBasic = _docBasics.FirstOrDefault(basic
                => basic.date == contractDoc.as_docBasic?.date &&
                basic.contragentID == contractDoc.as_docBasic?.contragentID);

            contractDoc.as_docBasic = existingBasic ?? new as_docBasics()
            {
                date = contractDoc.as_docBasic.date,
                contragentID = contractDoc.as_docBasic.contragentID
            };            
            AddOrModify(_docBasics, contractDoc.as_docBasic);

            contractDoc.as_docBasic.as_contragent = _contragents
                .Find(c => c.id == contractDoc.as_docBasic.contragentID);
            contractDoc.as_docType = _docTypes
                 .Find(type => type.id == contractDoc.typeID);
            contractDoc.as_docStatus = _docStatuses
                .Find(status => status.id == contractDoc.statusID);
            if (contractDoc.typeID != 2) contractDoc.as_contractFile.link = "";
            else if (contractDoc.typeID != 4) contractDoc.total = null;

            if (string.IsNullOrEmpty(contractDoc.as_contractFile.link))
            {
                var removed = _contractFiles.FirstOrDefault(file
                    => file.id == contractDoc.as_contractFile.contractDocID);
                if (removed != null) DeleteContractFile(removed);
            }
            else
            {
                ModifyContractFile(contractDoc.as_contractFile);
                contractDoc.as_contractFile.contractDocID = contractDoc.id;
            }
            return id;
        }

        public override int ModifyContractFile(as_contractFiles contractFile)
        {
            return AddOrModify(_contractFiles, contractFile);
        }

        public override int ModifyContragent(as_contragents contragent)
        {
            return AddOrModify(_contragents, contragent);
        }

        public override int ModifyShipment(as_shipments shipment)
        {
            int id = AddOrModify(_shipments, shipment);
            if (id <= 0) return id;
            shipment.as_shipper = _shippers
                .Find(shipper => shipper.id == shipment.shipperID);
            shipment.as_docStatus = _docStatuses
                .Find(status => status.id == shipment.statusID);
            return id; 
        }

        public override int ModifyShipper(as_shippers shipper)
        {
            return AddOrModify(_shippers, shipper);
        }

        public override IQueryable<as_shipments> GetShipments()
        {
            if (_shipments.Any(shipment => shipment.as_shipper == null ||
            shipment.as_docStatus == null))
                _shipments.ForEach(shipment =>
                {
                    shipment.as_shipper = _shippers
                        .First(shipper => shipper.id == shipment.shipperID);
                    shipment.as_docStatus = _docStatuses
                        .First(docStatus => docStatus.id == shipment.statusID);
                });
            return _shipments.AsQueryable();
        }

        public override IQueryable<as_shippers> GetShippers()
        {
            return _shippers.AsQueryable();
        }


        #region System and save/load
        private void SaveBin()
        {
            var collec = new List<object>();
            foreach (var field in thisFields)
            {
                if (!field.FieldType.IsGenericType) continue;
                collec.Add(field.GetValue(this));
            }
            bool saved = false;
            while (!saved)
            {
                DoIO(() =>
                {
                    stream = new FileStream(_PATH, FileMode.Create);
                    new BinaryFormatter().Serialize(stream, collec);
                    saved = true;
                });
            }
        }

        private bool LoadBin()
        {
            var res = false;
            var fileInfo = new FileInfo(_PATH);
            if (!fileInfo.Exists) return res;

            List<object> collec = null;
            DoIO(() =>
            {
                stream = fileInfo.OpenRead();
                collec = new BinaryFormatter().Deserialize(stream) as List<object>;
            });
            if (collec == null) return res;

            foreach (var field in thisFields)
            {
                if (!field.FieldType.IsGenericType) continue;
                var value = collec.Cast<object>()
                    .First(items => items.GetType() == field.FieldType);
                field.SetValue(this, value);
            }
            res = true;
            return res;
        }

        private void DoIO(Action action)
        {
            lock (_rnd)
            {
                try
                {
                    action();
                }
                catch (SerializationException e) { regenerate = true; }
                catch (Exception e) { }
                finally
                {
                    stream?.Close();
                    stream?.Dispose();
                }
            }
        }

        public override void Dispose()
        {
            SaveBin();
            base.Dispose();
        }
        #endregion
    }
}