using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MediaEditor.Web.Models
{
    public class MediaEditorItem
    {
        public int MediaId { get; set; }
        public string Name { get; set; }
        public string FilePath { get; set; }
    }
}