using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Umbraco.Core.Models;
using Umbraco.Web.Editors;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;
using MediaEditor.Web.Models;
using Newtonsoft.Json;
using Umbraco.Web.Models;

namespace MediaEditor.Controllers
{
    [PluginController("MediaEditor")]
    public class MediaEditorController : UmbracoAuthorizedApiController
    {
        /// <summary>
        /// Get all Media without folders
        /// </summary>
        /// <returns></returns>
        [HttpGet]        
        public IEnumerable<MediaEditorItem> GetMedias(int mediaId)
        {

           /* int pageIndex=1;
            int pageSize=1000;
            int totalRecords= 0;
            string filter="";
            string orderBy="Name";*/

            var ms = Services.MediaService;

                //How to get all media from root in a efficient way ?
                if (mediaId == 0)
                {
                    mediaId = ms.GetRootMedia().First().Id;
                }

                //TODO PAGING & Ordering on request
                //var descendants = ms.GetPagedDescendants(mediaId, pageIndex, pageSize,out totalRecords, orderBy, global::Umbraco.Core.Persistence.DatabaseModelDefinitions.Direction.Ascending, filter)//.Where(m => m.ContentType.Alias != "Folder")

                var descendants = ms.GetDescendants(mediaId).Where(m => m.ContentType.Alias != "Folder")
                    .Select(m => new MediaEditorItem() {
                        FilePath = (m.HasProperty("umbracoFile")) ? (m.Properties["umbracoFile"].Value.ToString().Contains("\"src\"") || m.Properties["umbracoFile"].Value.ToString().Contains("src:") ? JsonConvert.DeserializeObject<ImageCropDataSet>(m.Properties["umbracoFile"].Value.ToString()).Src : m.Properties["umbracoFile"].Value.ToString()) : "",
                        MediaId = m.Id,
                        Name = m.Name });                 
    
            

            return descendants;

        }

        [HttpGet]
        public IEnumerable<IMedia> GetMediaFolders(int id)
        {
            var ms = Services.MediaService;
            IEnumerable<IMedia> result = null;
            if (id < 0)
            {
                result = ms.GetRootMedia().Where(m => m.ContentType.Alias == "Folder");
            }
            else
            {
                result = ms.GetChildren(id).Where(m => m.ContentType.Alias == "Folder");
            }
            return result;
        }

        public async Task<HttpResponseMessage> Upload(int id)
        {
            string fileName = "";
            var ms = Services.MediaService;
            IMedia media = ms.GetById(id);


            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            string existingPath = media.Properties["umbracoFile"].Value.ToString();
            if (existingPath.Contains("\"src\"") || existingPath.Contains("src:"))
            {
                existingPath = JsonConvert.DeserializeObject<ImageCropDataSet>(existingPath).Src;
            }

            var directory = Path.GetDirectoryName(existingPath);
            string mapdirectory = HttpContext.Current.Server.MapPath(directory);
            if (!Directory.Exists(mapdirectory)) Directory.CreateDirectory(mapdirectory);
            var provider = new MultipartFormDataStreamProvider(mapdirectory);

            // Read the form data and return an async task.
            var task = await Request.Content.ReadAsMultipartAsync(provider).
                ContinueWith<HttpResponseMessage>(t =>
                {
                    if (t.IsFaulted || t.IsCanceled)
                    {
                        return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, t.Exception);
                    }

                    fileName = provider.FileData.First().Headers.ContentDisposition.FileName;
                    if (fileName.StartsWith("\"") && fileName.EndsWith("\""))
                    {
                        fileName = fileName.Trim('"');
                    }
                    if (fileName.Contains(@"/") || fileName.Contains(@"\"))
                    {
                        fileName = Path.GetFileName(fileName);
                    }
                    //delete existing file
                    if (System.IO.File.Exists(Path.Combine(mapdirectory, fileName)))
                    {
                        System.IO.File.Delete(Path.Combine(mapdirectory, fileName));
                    }
                    System.IO.File.Move(provider.FileData.First().LocalFileName, Path.Combine(mapdirectory, fileName));

                    //save file to replace media
                    media.Properties["umbracoFile"].Value = Path.Combine(directory,fileName).Replace("\\","/");
                    if (media.HasProperty("umbracoExtension"))                    
                        media.Properties["umbracoExtension"].Value = Path.GetExtension(fileName).Replace(".", string.Empty);                    
                    if(media.HasProperty("umbracoBytes"))
                        media.Properties["umbracoBytes"].Value = provider.FileData.First().Headers.ContentDisposition.Size;

                    //To change the media to the new name remove this comment
                    //media.Name = fileName.Replace(Path.GetExtension(fileName),"");

                    ms.Save(media);

                    //Extension verification optional
                    /*if (Path.GetExtension(e.FileName) != media.Properties["umbracoExtension"].Value.ToString())
                    { 
                        throw new Exception("File has not the same extension of the existing one, create a new file in media section");
                        return;
                    }*/

                    //fileName = file.LocalFileName;                       
                    //string savePath = mapdirectory + "/" + Path.GetFileName(fileName);
                    //


                     return Request.CreateResponse(HttpStatusCode.OK, fileName); 
                });


            return task;
        }

    }
}