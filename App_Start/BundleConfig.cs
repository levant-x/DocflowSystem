using System.Web;
using System.Web.Optimization;

namespace arkAS
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new Bundle("~/hotKeys").Include(
                "~/js/as/controls/as.hotKey.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/jquery-core").Include(
                "~/js/jquery-ui-1.11.4/external/jquery/jquery.js"
                ));
                       

            bundles.Add(new Bundle("~/bundles/libs").Include(
                        "~/js/jquery-ui-1.11.4/jquery-ui.js",
                        "~/js/jquery.signalR-2.1.2.min.js",
                        "~/tiny_mce/tiny_mce_src.js",
                        "~/js/bootstrap/js/bootstrap.min.js",
                        "~/js/Flotr/flotr2.min.js",
                        "~/js/audio/recorder.js",
                        "~/js/audio/recorderWorker.js",
                        "~/tiny_mce/tiny_mce_src.js",
                        "~/js/cropper/cropper.min.js",
                        "~/js/jsrender.js"));

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
                        "~/js/as/controls/as.crud2.js",
                        "~/js/as/controls/as.audioRecorder.js",
                        "~/js/as/controls/as.opinion.js",
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
                          "~/js/AS/controls/mics/as.countdown.js",
                          "~/js/AS/controls/as.profile.js"
                      );
            bundles.Add(asBundle);
           

            bundles.Add(new StyleBundle("~/bundles/css").Include(
                "~/js/jquery-ui-1.11.4/jquery-ui.min.css",
                "~/js/jquery-ui-1.11.4/jquery-ui.css", //"~/js/bootstrap/css/bootstrap*",
                "~/js/bootstrap/css/bootstrap-theme.min.css",
                "~/js/bootstrap/css/bootstrap.min.css",
                "~/content/Site.css",
                "~/content/custom.css",
                "~/js/as/as.css",
                "~/js/cropper/cropper.min.css",
                "~/js/uploadify/uploadify.css"));

             bundles.Add(new StyleBundle("~/bundles/css-ext").Include(
                 "~/js/bootstrap/css/bootstrap*",
                 "~/js/others/b-popup.js",
                 "~/Content/custom.css"));

            bundles.Add(new StyleBundle("~/bundles/sb-admin-css").Include(
                        "~/Content/sb-admin-2-1.0.5/bower_components/metisMenu/dist/metisMenu.min.css",
                        "~/Content/sb-admin-2-1.0.5/dist/css/timeline.css",
                        "~/Content/sb-admin-2-1.0.5/dist/css/sb-admin-2.css",
                        "~/Content/sb-admin-2-1.0.5/bower_components/morrisjs/morris.css",
                        "~/Content/sb-admin-2-1.0.5/bower_components/font-awesome/css/font-awesome.min.css"));
         
             bundles.Add(new Bundle("~/bundles/sb-admin-js").Include(
                        "~/Content/sb-admin-2-1.0.5/bower_components/metisMenu/dist/metisMenu.min.js",
                        "~/Content/sb-admin-2-1.0.5/dist/js/sb-admin-2.js"
                         ));

            // System.Web.Optimization.BundleTable.EnableOptimizations = false;
            // asBundle.Transforms.Clear();

        }
    }
}
