using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using Jellyfin.Plugin.NewReviewPlugin.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.NewReviewPlugin
{
    public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages
    {
        private readonly ILogger<Plugin> _logger;

        public override string Name => "New Review Plugin";

        public override Guid Id => Guid.Parse("a1b2c3d4-e5f6-7890-1234-567890abcdef");

        public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer, ILogger<Plugin> logger)
            : base(applicationPaths, xmlSerializer)
        {
            Instance = this;
            _logger = logger;

            // Inject ratings script into index.html
            if (!string.IsNullOrWhiteSpace(applicationPaths.WebPath))
            {
                var indexFile = Path.Combine(applicationPaths.WebPath, "index.html");
                if (File.Exists(indexFile))
                {
                    string indexContents = File.ReadAllText(indexFile);
                    
                    // Script to inject
                    string scriptReplace = "<script plugin=\"NewReviewPlugin\".*?</script>";
                    string scriptElement = "<script plugin=\"NewReviewPlugin\" src=\"/web/ConfigurationPage?name=ratings.js\"></script>";
                    
                    if (!indexContents.Contains(scriptElement))
                    {
                        _logger.LogInformation("Inyectando script de NewReviewPlugin en {indexFile}", indexFile);
                        
                        // Remove old scripts from this plugin
                        indexContents = Regex.Replace(indexContents, scriptReplace, "", RegexOptions.Singleline);
                        
                        // Insert script before closing body tag
                        int bodyClosing = indexContents.LastIndexOf("</body>");
                        if (bodyClosing != -1)
                        {
                            indexContents = indexContents.Insert(bodyClosing, scriptElement);
                            
                            try
                            {
                                File.WriteAllText(indexFile, indexContents);
                                _logger.LogInformation("Script de NewReviewPlugin inyectado con éxito");
                            }
                            catch (Exception e)
                            {
                                _logger.LogError(e, "Error escribiendo en {indexFile}", indexFile);
                            }
                        }
                    }
                }
            }
        }

        public static Plugin? Instance { get; private set; }

        public IEnumerable<PluginPageInfo> GetPages()
        {
            return new[]
            {
                new PluginPageInfo
                {
                    Name = "NewReviewPluginConfig",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.configPage.html",
                    EnableInMainMenu = true
                },
                new PluginPageInfo
                {
                    Name = "ratings.js",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.ratings.js"
                }
            };
        }
    }
}
