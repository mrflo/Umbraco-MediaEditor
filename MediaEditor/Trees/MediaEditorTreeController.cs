using MediaEditor.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Formatting;
using System.Web;
using umbraco;
using umbraco.BusinessLogic.Actions;
using Umbraco.Core;
using Umbraco.Core.Models;
using Umbraco.Web.Models.Trees;
using Umbraco.Web.Mvc;
using Umbraco.Web.Trees;

namespace MediaEditor.Trees
{
    [Tree("MediaEditor", "MediaEditor", "Media Folder")]
    [PluginController("MediaEditor")]
    public class MediaEditorTreeController : TreeController
    {
        protected override TreeNodeCollection GetTreeNodes(string id, FormDataCollection queryStrings)
        {
            var ctrl = new MediaEditorController();
            var nodes = new TreeNodeCollection();

            //var item = this.CreateTreeNode("dashboard", id, queryStrings, "My item", "icon-truck", true);
            foreach(IMedia folder in ctrl.GetMediaFolders(int.Parse(id)))
            {
                var item = this.CreateTreeNode(folder.Id.ToString(), folder.ParentId.ToString(), queryStrings, folder.Name, "icon-folder", (folder.Children()!=null && folder.Children().Where(m => m.ContentType.Alias == "Folder").Count() > 0)); 
                nodes.Add(item);
            }

            
         
           
            return nodes;
        }

        protected override MenuItemCollection GetMenuForNode(string id, FormDataCollection queryStrings)
        {
            var menu = new MenuItemCollection();
            menu.Items.Add<RefreshNode, ActionRefresh>(ui.Text("actions", ActionRefresh.Instance.Alias), false);
            return menu;
        }
    }
}