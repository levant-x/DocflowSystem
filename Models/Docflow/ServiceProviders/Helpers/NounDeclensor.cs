using Cyriller;
using Cyriller.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Docflow
{
    public class NounDeclensor
    {
        public static readonly NounDeclensor Instance = new NounDeclensor();

        protected static CyrNounCollection nouns = new CyrNounCollection();
        protected static CyrAdjectiveCollection adjs = new CyrAdjectiveCollection();   


        private NounDeclensor()
        {
        }

                
        public string DeclineNoun(string word, string caseName = "Nominative")
        {
            var nounsCollec = nouns.Get(word, GetConditionsEnum.Similar);
            var declineRes = nounsCollec.Decline();
            return GetDeclensionInCase(declineRes, caseName);
        }

        public string DeclineNoun(string word, int number, string caseName = "Nominative")
        {
            var nounsCollec = nouns.Get(word, GetConditionsEnum.Similar);
            var cyrNumber = new CyrNumber();
            CyrNumber.Item item = new CyrNumber.Item(nounsCollec);
            var declineRes = cyrNumber.Decline(number, item);
            return GetDeclensionInCase(declineRes, caseName);
        }

        public string DeclineAdjective(string word, string caseName, string anim = "")
        {
            var adj = adjs.Get(word, GetConditionsEnum.Similar);
            if (!Enum.TryParse(anim, out AnimatesEnum animKind))
            {
                animKind = AnimatesEnum.Inanimated;
            }
            var declineRes = adj.Decline(animKind);
            return GetDeclensionInCase(declineRes, caseName);
        }

        public string DeclinePhrase(string words, string caseName = "Nominative")
        {
            var phrase = new CyrPhrase(nouns, adjs);            
            var declineRes = phrase.Decline(words, GetConditionsEnum.Similar);
            return GetDeclensionInCase(declineRes, caseName);
        }

        public string DeclinePhraseInPlural(string words, string caseName = "Nominative")
        {
            var phrase = new CyrPhrase(nouns, adjs);
            var declineRes = phrase.DeclinePlural(words, GetConditionsEnum.Similar);
            return GetDeclensionInCase(declineRes, caseName);
        }

        public string HowManyOf(string word, int number)
        {
            string howMany = number == 0 ? "Нет" : number.ToString();
            string res = DeclineNoun(word, number).Split(' ').Last();
            return $"{howMany} {res}";            
        }

        private string GetDeclensionInCase(CyrResult cyrResult, string caseName = "Nominative")
        {
            var res = cyrResult.GetType().GetProperty(caseName).GetValue(cyrResult);
            return res.ToString();
        }
    }
}