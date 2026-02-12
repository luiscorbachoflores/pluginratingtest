using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.NewReviewPlugin.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public bool EnableNotifications { get; set; } = true;
    }
}
