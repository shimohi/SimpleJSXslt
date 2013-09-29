/**
 * SimpleJSXslt
 * Copyright (c) 2013,Yosikazu Saito
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
//名前空間宣言（被らなそうな物を適当に宣言）
var shimohi;
if(!shimohi)
    shimohi  = {};
if(!shimohi.xsl)
    shimohi.xsl = {};

//定数定義
shimohi.xsl.MSXML_DOCUMENT = 'MSXML.DomDocument';
shimohi.xsl.MSXML_XML_REQUEST = 'Msxml2.XMLHTTP.3.0';
shimohi.xsl.APPLICATION_XML = 'application/xml';
shimohi.xsl.GET='GET';
shimohi.xsl.DATA='data:';
shimohi.xsl.CHAR_SET=';charset=utf-8,';
shimohi.xsl.UNDEFINED='undefined';

(function($) {
    //DOMParserが実装されていないブラウザに対し、DOMParserkの定義
    if(typeof DOMParser == shimohi.xsl.UNDEFINED){
        DOMParser=function (){}
        DOMParser.prototype.parseFromString = function (str, contentType) {
            if (typeof ActiveXObject != shimohi.xsl.UNDEFINED) {
                var d = new ActiveXObject(shimohi.xsl.MSXML_DOCUMENT);
                d.loadXML(str);
                return d;
            }
            if (typeof XMLHttpRequest == shimohi.xsl.UNDEFINED){
                return null;
            }
            var req = new XMLHttpRequest;
            req.open(
                shimohi.xsl.GET,
                shimohi.xsl.DATA + (contentType || shimohi.xsl.APPLICATION_XML),
                shimohi.xsl.CHAR_SET + encodeURIComponent(str),
                false
            );
            if (req.overrideMimeType) {
                req.overrideMimeType(contentType);
            }
            req.send(null);
            return req.responseXML;
        }
    }
    function getXMLHttpRequest(){
        if (window.ActiveXObject){
            return new ActiveXObject(shimohi.xsl.MSXML_XML_REQUEST);
        }
        return new XMLHttpRequest();
    }
    /**
     * URLからXMLDomドキュメントを生成する。
     * @param xmlURL
     * @return DOMドキュメント
     */
    function loadXMLFromURL(xmlURL)
    {
        var xhttp = getXMLHttpRequest(); 
        xhttp.open(shimohi.xsl.GET,xmlURL,false);
        xhttp.send('');
        return xhttp.responseXML;
    }
    /**
     * 文字列からXMLDomドキュメントを生成する。
     * @param xmlString
     * @param contentType
     * @return DOMドキュメント
     */
    function loadXMLFromString(xmlString,contentType){
        return new DOMParser().parseFromString(xmlString,contentType);
    }
    /**
     * 指定されたオブジェクトがDOMNodeかどうかを判定する。
     * @param node
     * @return 判定結果
     */
    function isDomNode(node){
        if(node && typeof(node.nodeType) == 'number'){
            return true;
        }
        return false;
    }
    /**
     * XMLDomドキュメントを生成する。
     * @param xmlInfo 文書のURLまたは文書文字列
     * @return DOMドキュメント
     */
    function loadXML(xmlInfo){
        //scriptタグの解析
        var parsedXml = parseScriptElement(xmlInfo);
        //既にDomオブジェクトである場合
        if(isDomNode(parsedXml)){
            return parsedXml;
        }
        //テキストで直接xmlが記述されている場合
        if(parsedXml.lastIndexOf('<', 0) === 0){
            return loadXMLFromString(parsedXml,'text/xml');
        }
        //外部からロードを行う場合
        return loadXMLFromURL(parsedXml);
    }
    /**
     * Scriptタグの解析
     * @param scriptElement
     */
    function parseScriptElement(scriptElement){
        //scriptタグ以外
        if(scriptElement.tagName==null || scriptElement.tagName.toLowerCase()!='script'){
            return scriptElement;
        }
        //type属性がxmlではない
        if(scriptElement.type==null || scriptElement.type.indexOf('xml') <= -1){
            return scriptElement;
        }
        //src属性が存在する場合
        if(scriptElement.src!=null && scriptElement.src.length > 0){
            return scriptElement.src;
        }
        //sprictタグ内に直接記述されている場合
        var result = scriptElement.innerHTML;
        if(result == null || result.length==0){
            return "";
        }
        return result.replace(/(^\s+)|(\s+$)/g,'');
    }
    /**
     * xmlSourceで指定したXML文書をXSLT変換し、HTMLのDOMオブジェクトを返す。
     * @param xmlSource xml文書(Domオブジェクト or XML文字列 or URL or scriptタグ)
     * @param xsltSource xslt文書(Domオブジェクト or XML文字列 or URL or scriptタグ)
     */
    function transform(xmlSource,xslSource){
        //DOM生成
        var xml = loadXML(xmlSource);
        var xsl = loadXML(xslSource);
        //IEの場合
        if (window.ActiveXObject){
            xmlStr=xml.transformNode(xsl);
            var div = document.createElement('div');
            document.body.appendChild(div);
            div.innterHTML=xmlStr;
            var result = div.removeChild(div.firstChild);
            document.body.removeChild(div);
            return result;
        }
        xsltProcessor=new XSLTProcessor();
        xsltProcessor.importStylesheet(xsl);
        return  xsltProcessor.transformToFragment(xml,document);
    }
    var ns=shimohi.xsl;
    ns.loadXML=loadXML;
    ns.transform = transform;
})();
//↑ここまでが単独で動作するコード
//↓以下はJQueryの拡張
$.fn.extend({
    transform: function(xslt){
        var result = [];
        this.each(function(){
            result.push(shimohi.xsl.transform(this,xslt));
        });
        return $(result);
    },
    xslt: function(xml){
        var result = [];
        this.each(function(){
            result.push(shimohi.xsl.transform(xml,this));
        });
        return $(result);
    }
});
