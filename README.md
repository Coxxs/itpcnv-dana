# itpcnv-dana

Convert .itp files to texture files.

Currently Support Ys VIII (PS4 & PC) assets.

## Usage

Simply drag and drop `.itp` files onto run.bat, or:

```
node index.js file1.itp file2.itp ...
```

[Node.js](https://nodejs.org/) is required.

## Tips

### How to unpack `.xai` file?

Use [YsVIII-tools](https://github.com/yosh778/YsVIII-tools) or my [fork](https://github.com/Coxxs/YsVIII-tools) which fixes an issue when unpacking `.xai` > 4GB.

### How to view `.dds` texture?

* Use [Noesis](http://www.richwhitehouse.com/noesis/nms/index.php) to view and convert `.dds` texture:
  
  ```
  Noesis.exe ?cmode input.dds output.png
  ```
* [paint.net](https://www.getpaint.net/)
* Photoshop with [Intel® Texture Works Plugin](https://software.intel.com/content/www/us/en/develop/articles/intel-texture-works-plugin.html)

## License

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)