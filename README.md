#SimpleJSXslt

JavaScriptからXSLT変換を行う為のJQueryプラグイン

##.transform(xslt)
Domオブジェクトを指定されたxslスタイルシートで変換し、その結果を返します。

###xslt
xsltスタイルシート。以下の方法での指定が可能です。

* URLでXSLTのリソースを指定。
* XSLTを文字列で直接指定。
* script要素のIDを指定。
	* src属性にURLを指定。
	* 要素内に直接XSLTを記述。

####XSLTを文字列で直接指定した例
```javascript
	var xslt = '<script type="text/xml" id="xsl_example">';
	xslt 	+= '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">';
	xslt 	+= '<xsl:template match="/">';
	xslt 	+= '<h1>hoge</h1>';
	xslt 	+= '</xsl:template>';
	xslt 	+= '</xsl:stylesheet> ';
	$(window).on('load',function(){
		$('#xml_example').transform(xslt).appendTo('#example');
	});
```

####scriptタグを指定した例
```html
	<script type="text/xml" id="xsl_example">
		<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
			<xsl:template match="/">
				:
			</xsl:template>
		</xsl:stylesheet> 
	</script>
```


```javascript
	//スクリプト要素をtransformの引数に指定し、idが「example」の要素にappend
	$(window).on('load',function(){
		$('#xml_example').transform($('#xsl_example')[0]).appendTo('#example');
	});
```


##.xslt(xml)
transformメソッドと、引数とオブジェクトを入れ替えたメソッド。指定方法も同じです。

###xml
変換対象のxmlをURL or 文字列 or script要素で指定します。
