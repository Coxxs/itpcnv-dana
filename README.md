# itpcnv-dana

Convert .itp files to texture files.

`.itp` has many different versions, `itpcnv-dana` supports __Ys VIII (PS4 & PC)__ assets.

## Usage

Simply drag and drop `.itp` files onto run.bat, you will get converted `.dds` file. [Node.js](https://nodejs.org/) is required.

Convert via command line:

```
node index.js file1.itp file2.itp ...
```

## Tips

### How to unpack `.xai` file?

Use [YsVIII-tools](https://github.com/yosh778/YsVIII-tools) or my [fork](https://github.com/Coxxs/YsVIII-tools) which fixes an issue when unpacking `.xai` > 4GB.

### How to view `.dds` texture?

* You can use [Noesis](http://www.richwhitehouse.com/noesis/nms/index.php) to [batch convert](http://www.richwhitehouse.com/noesis/nms/index.php?content=userman#sect_15) convert `.dds`.

  Convert through command line is also supported:
  ```
  Noesis.exe ?cmode input.dds output.png
  ```
* You can also use [paint.net](https://www.getpaint.net/) to view (or edit) `.dds`.
* Alternatively, you can use Photoshop with [Intel® Texture Works Plugin](https://software.intel.com/content/www/us/en/develop/articles/intel-texture-works-plugin.html).

## License

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
