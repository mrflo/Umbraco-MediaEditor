using Umbraco.Core;
using umbraco.BusinessLogic;


namespace MediaEditor
{
    public class RegisterEvents : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            Helper.Installer.LanguageInstaller.CheckAndInstallLanguageActions();
        }

    }
}