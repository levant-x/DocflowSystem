
using arkAS.Models.Docflow;
using Newtonsoft.Json;
using Ninject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Docflow
{


    public class SearchQueryModel
    {
        protected static Stack<string[]> queryLexems = new Stack<string[]>();

        protected static Dictionary<string, Action<string, SearchQueryModel>> 
            parseInstructions = 
            new Dictionary<string, Action<string, SearchQueryModel>>();

        [Inject]
        public static IDebugger Debugger { get; set; }

        public Dictionary<string, string> FilterBy { get; } =
            new Dictionary<string, string>();

        public Dictionary<string, object> OrderBy { get; } =
            new Dictionary<string, object>();

        public uint PageBy { get; set; }
        public uint Page { get; set; } = 1;
        public bool Apply { get; set; } = false;



        static SearchQueryModel()
        {
            parseInstructions.Add("order-by", ParseOrdering);
            parseInstructions.Add("apply", SetApplyTrue);
            parseInstructions.Add("page-by", SetPagination);
            parseInstructions.Add("page", SetPageNum);
        }



        public string ToJson()
        {
            return JsonConvert.SerializeObject(this);
        }

        public static SearchQueryModel Parse(string input)
        {
            if (string.IsNullOrEmpty(input)) return new SearchQueryModel();
            try
            {
                var res = JsonConvert.DeserializeObject<SearchQueryModel>(input);
                return res; 
            }
            catch(Exception e) { Debugger?.Log(e.Message); }
            return ParseQuery(input);
        }

        protected static SearchQueryModel ParseQuery(string query)
        {
            var res = new SearchQueryModel();
            var lexems = query.Split('&')
                .Select(lx => lx.Split('='))
                .Where(lexem => lexem.Length > 1);

            foreach (var nameVal in lexems)
            {
                queryLexems.Push(nameVal);
                string key = nameVal[0].ToLower();

                if (parseInstructions.ContainsKey(key))
                { parseInstructions[key](nameVal[1], res); }
                else ParseProperty(nameVal, res);
            }
            queryLexems.Clear();
            return res;
        }

        private static void ParseProperty(string[] nameVal, SearchQueryModel model)
        {
            if (nameVal.Length < 2) return;
            var key = nameVal[0];
            if (model.FilterBy.ContainsKey(key)) return;
            model.FilterBy.Add(key, nameVal[1]);
        }

        private static void ParseOrdering(string queryVal, SearchQueryModel model)
        {
            var lexems = queryVal.Split('-');
            for (int i = 0; i < lexems.Length / 2; i += 2)
            {
                if (lexems.Length >= i + 1) continue;
                string propName = lexems[i], dir = lexems[i + 1];
                model.OrderBy.Add(propName, dir);
            }
        }

        private static void SetPagination(string queryVal, SearchQueryModel model)
        {
            uint.TryParse(queryVal, out uint page);
            model.PageBy = page;
        }

        private static void SetPageNum(string queryVal, SearchQueryModel model)
        {
            uint.TryParse(queryVal, out uint page);
            model.Page = page;
        }

        private static void SetApplyTrue(string key, SearchQueryModel model)
        {
            model.Apply = true;
        }
    }
}