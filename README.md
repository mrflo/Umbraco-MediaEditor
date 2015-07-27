# Umbraco-MediaEditor
Find and update media items in an easy way
Umbraco MediaEditor is a Umbraco package that helps you edit your media items in a simple way.
Currently in Umbraco, it's not easy to edit an existing media without loosing the link to it on an existing content. You have to manually select the media and click on "remove file" then re-upload a new file to overwrite it. And you have to do it one by one. 
This tool helps you to find and update easily multiple files in the media section.

#Asynchronous upload: Upload multiple files in a queue
Just select all the files that you want to update and they go in a queue. You can then click on "upload all" and just grab a coffee and relax when your media are uploading (asynchronous multiple file upload).
The original name will be kept and the file behind each media will be replace. This is particularly usefull for those who are creating a "download center" on their website and for those of you who have a lot of links to media elements in your content pages.
This is based on two angular plugins:
 
Angular File Upload https://github.com/nervgh/angular-file-upload
ng-table
 
Remark : For those who have a media section with a Image cropper by default, please notre that for the moment the filename is appearing with the JSON data from the cropper. Overwrite is working well on those images but you might need to recreate the focal point.

The project on Umbraco: https://our.umbraco.org/projects/backoffice-extensions/media-editor/

Login for umbraco:
admin admin
