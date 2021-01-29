using System.Web;
using System.Web.Optimization;

namespace arkAS
{
    public class BundleMobileConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new Bundle("~/bundles/jquery")
                .Include("~/js/jquery-1.11.2.min.js", "~/js/jquery.signalR-2.1.2.min.js"));

            bundles.Add(new Bundle("~/bundles/jquerymobile")
                .Include("~/Scripts/jquery.mobile-{version}.js"));

            bundles.Add(new StyleBundle("~/Content/Mobile/css")
                .Include("~/Content/Site.Mobile.css"));

            bundles.Add(new StyleBundle("~/Content/jquerymobile/css")
                .Include("~/Content/jquery.mobile-{version}.css"));

            bundles.Add(new Bundle("~/bundles/libs").Include(
     "~/js/jquery-ui-1.11.4/external/jquery/jquery.js",
     "~/js/jquery-ui-1.11.4/jquery-ui.js",
    
            "~/js/jquery.inputmask-3.x/js/inputmask.js",
            "~/js/jquery.signalR-2.1.2.min.js",
            "~/tiny_mce/tiny_mce_src.js",
            "~/js/bootstrap/js/bootstrap.min.js",
            "~/js/Flotr/flotr2.min.js",
            "~/js/audio/recorder.js",
            "~/js/audio/recorderWorker.js",
            "~/tiny_mce/tiny_mce_src.js"
             ));

            bundles.Add(new Bundle("~/bundles/highcharts").Include(
                "~/js/Funnel/hightcharts/highcharts.js",
                "~/js/Funnel/hightcharts/Funnel.js"));

            var asBundle = new Bundle("~/bundles/as").Include(
                          "~/js/as/as.js",
                        "~/js/as/as.sys.js",
                        "~/js/as/as.tools.js",
                        "~/js/as/as.makeup.js",
                        "~/js/as/as.ark.js",
                        "~/js/as/controls/as.crud.js",
                        "~/js/as/controls/as.audioRecorder.js",
                        "~/js/as/controls/as.form.js",
                        "~/js/jquery.inputmask.js",
                        "~/js/as/controls/as.simpleForm.js",
                        "~/js/as/controls/as.favorites.js",
                        "~/js/as/controls/as.graphic.js",
                        "~/js/as/controls/as.export.js",
                        "~/js/as/controls/as.metrics.js",
                        "~/js/as/controls/as.sqlCrud.js",
                        "~/js/as/controls/as.replace.js",
                        "~/js/as/controls/as.mosaik.js",
                        "~/js/as/controls/isotope.pkgd.min.js",
                        "~/js/as/controls/imagesloaded.pkgd.min.js",
                         "~/js/as/controls/as.images.js",
                         "~/js/as/controls/as.info.js",
                         "~/js/as/controls/as.files.js",
                         "~/js/as/controls/as.textMistakes.js",
                         "~/js/AS/controls/as.userchecks.js",
                         "~/js/AS/controls/as.ark.image.js",
                         "~/js/AS/controls/as.image.text.js",
                          "~/js/AS/controls/as.signalr.js",
                          "~/js/AS/controls/as.calc.js",
                          "~/js/AS/controls/mics/as.jubilee.js",
                          "~/js/AS/controls/mics/as.countdown.js"
                      );
            bundles.Add(asBundle);


            bundles.Add(new StyleBundle("~/bundles/css").Include(
                //"~/Content/jquery-ui.min.css",
                            "~/js/jquery-ui-1.11.4/jquery-ui.min.css",
                            "~/js/jquery-ui-1.11.4/jquery-ui.css",
                        "~/js/bootstrap/css/bootstrap-full.min.css",
                        "~/content/Site.css",
                        "~/js/as/as.css",
                        "~/js/uploadify/uploadify.css"));

        }
    }
}