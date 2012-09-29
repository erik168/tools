# -*- coding:utf-8 -*-

""" 
docbook2markdown

@version 0.9
@author U{errorrik<mailto:errorrik@gmail.com>}
"""

import argparse
import re
from xml.dom import minidom

# parse args
parser = argparse.ArgumentParser( 
    prog = "docbook2markdown",
    description = "docbook to markdown" 
)
parser.add_argument( '-v', '--version', 
    action = "version",
    version = "%(prog)s 0.9"
)
parser.add_argument( '-i', '--input', required = True,
    metavar = "inputFile", help = "input file" 
)
parser.add_argument( '-o', '--output', required = True,
    metavar = "outputFile", help = "output file" 
)
args = parser.parse_args()


# 
doc = minidom.parse( args.input )
root = doc.documentElement
titleLevel = 1
indentLevel = 0


def getIndentTab( i = 0 ):
    """
    get \\t indent
    """

    text = []
    while i < indentLevel:
        text.append( '\t' )
        i += 1
    return ''.join( text )


def getBlankLine( count = 1 ):
    """
    get blank line
    """

    indent = getIndentTab()
    i = 0
    text = []
    while i < count:
        text.append( '\n' + indent )
        i += 1
    return ''.join( text )


def n_GetsByTag( node, tag ):
    """
    get elements by tag name
    @param node: parent node
    @param tag: tag name
    """

    return node.getElementsByTagName( tag );


def n_GetByTag( node, tag ):
    """
    get first element by tag name
    @param node: parent node
    @param tag: tag name
    """

    return node.getElementsByTagName( tag )[ 0 ];


def n_NextElem( node ):
    """
    get next element
    @param node: target node
    """

    while True:
        node = node.nextSibling
        if node == None or node.nodeType == 1:
            break

    return node


def n_FirstChild( node ):
    """
    get first child element
    @param node: target node
    """

    child = node.firstChild;
    if child.nodeType != 1:
        child = n_NextElem( child )

    return child


def n_CDataChild( node ):
    """
    get first cdata element
    @param node: target node
    """

    child = node.firstChild;
    while child != None:
        if child.nodeType == 4:
            return child
        child = child.nextSibling

    return None


def getTitleContent( elem ):
    """
    get title content
    @param elem: title element
    """

    return elem.firstChild.nodeValue



def walk( start ):
    """
    walk and process element
    @param start: element which is the first
    """

    text = []
    blankRe = re.compile( '^[\\t\\n ]*$' )

    while True:
        if start == None:
            break;

        if start.nodeType == 3:
            if not blankRe.search( start.nodeValue ):
                text.append( start.nodeValue )
        elif start.nodeType == 1:
            text.append( {
                'chapter': lambda n: processChapter( n ),
                'section': lambda n: processSection( n ),
                'para': lambda n: processPara( n ),
                'title': lambda n: processTitle( n ),
                'table': lambda n: processTable( n ),
                'important': lambda n: processImportant( n ),
                'caution': lambda n: processCaution( n ),
                'warning': lambda n: processWarning( n ),
                'tip': lambda n: processTip( n ),
                'ulink': lambda n: processUlink( n ),
                'citetitle': lambda n: processCitetitle( n ),
                'example': lambda n: processExample( n ),
                'appendix': lambda n: processAppendix( n ),
                'biblioentry': lambda n: processBiblioentry( n ),
                'programlisting': lambda n: processProgramlisting( n ),
                'orderedlist': lambda n: processOrderedlist( n )
            }[ start.tagName ]( start ) )

        start = start.nextSibling

    return ''.join( text )


def processUlink( elem ):
    """
    process ulink element.
    @param elem: ulink element
    """
    
    url = elem.getAttributeNode( 'url' ).nodeValue
    text = walk( n_FirstChild( elem ) )
    return '[' + text + '](' + url + ')'


def processCitetitle( elem ):
    """
    get citetitle content
    @param elem: citetitle element
    """

    return elem.firstChild.nodeValue


def processTitle( elem ):
    """
    process title element. title level will auto match.
    @param elem: title element
    """

    i = 0
    prefix = ''
    indent = getIndentTab()
    while i < titleLevel:
        i += 1
        prefix += '#'

    return getBlankLine( 1 ) + indent + prefix + ' ' + getTitleContent( elem ) + getBlankLine( 2 )


def processOrderedlist( elem ):
    """
    process orderedlist
    @param elem: orderedlist element
    """

    global indentLevel
    text = []
    indentLevel += 1
    items = n_GetsByTag( elem, 'listitem' )
    index = 1
    for item in items:
        text.append( processListitem( item, str( index ) + '. ' ) )
        index += 1

    indentLevel -= 1
    return ''.join( text ) + getBlankLine()


def processListitem( elem, prefix ):
    """
    process listitem
    @param elem: listitem element
    @param prefix: item prefix 
    """

    pre = '\n' + getIndentTab( 1 ) + prefix
    if len( elem.childNodes ) == 1:
        first = elem.firstChild

        if first.nodeType == 3:
            return pre + first.nodeValue
        elif first.tagName == 'para':
            return pre + first.firstChild.nodeValue

    return  pre + walk( n_FirstChild( elem ) )


def processImportant( elem ):
    """
    process important
    @param elem: important element
    """

    bl = getBlankLine()
    return '\n[info]:' + bl + walk( elem.firstChild ) + '\n~~~~' + bl


def processCaution( elem ):
    """
    process caution
    @param elem: caution element
    """

    bl = getBlankLine()
    return '\n[info]:' + bl + walk( elem.firstChild ) + '\n~~~~' + bl



def processTip( elem ):
    """
    process tip
    @param elem: tip element
    """

    bl = getBlankLine()
    return '\n[note]:' + bl + walk( elem.firstChild ) + '\n~~~~' + bl


def processWarning( elem ):
    """
    process warning
    @param elem: warning element
    """

    bl = getBlankLine()
    return '\n[alert]:' + bl + walk( elem.firstChild ) + '\n~~~~' + bl


def processExample( elem ):
    """
    process example
    @param elem: example element
    """

    global titleLevel
    titleLevel += 1
    text = walk( n_FirstChild( elem ) )
    titleLevel -= 1
    return text


def processProgramlisting( elem ):
    """
    process programlisting
    @param elem: programlisting element
    """
    
    node = n_CDataChild( elem )
    indent = getIndentTab()
    if node == None:
        node = elem.firstChild

    return indent + '\t' + node.nodeValue.replace( '\n', '\n\t' + indent ) + getBlankLine( 2 )


def getEntryContent( elem ):
    """
    get entry content
    @param elem: entry element
    """

    return elem.firstChild.nodeValue.replace( "|", "&brvbar;" )


def processThead( elem ):
    """
    process thead
    @param elem: thead element
    """

    entrys = n_GetsByTag( elem, 'entry' )
    text = []
    for entry in entrys:
        text.append( getEntryContent( entry ) )
    return '|* ' + ' *|* '.join( text ) + ' *|' + getBlankLine()


def processTbody( elem ):
    """
    process tbody
    @param elem: tbody element
    """

    rows = n_GetsByTag( elem, 'row' )
    text = []
    for row in rows:
        rowText = []
        entrys = n_GetsByTag( row, 'entry' )
        for entry in entrys:
            rowText.append( getEntryContent( entry ) )
        text.append( '| ' + ' | '.join( rowText ) + ' |' )

    return '\n'.join( text )


def processTable( elem ):
    """
    process table
    @param elem: table element
    """

    text = []
    global titleLevel
    titleLevel += 1
    text.append( processTitle( n_GetByTag( elem, 'title' ) ) )
    text.append( processThead( n_GetByTag( elem, 'thead' ) ) )
    text.append( processTbody( n_GetByTag( elem, 'tbody' ) ) )
    titleLevel -= 1
    return ''.join( text ) + getBlankLine( 2 )


def processPara( elem ):
    """
    process para
    @param elem: para element
    """


    return walk( elem.firstChild ) + getBlankLine( 2 )


def processChapter( elem ):
    """
    process chapter
    @param elem: chapter element
    """

    global titleLevel
    titleLevel += 1
    text = walk( n_FirstChild( elem ) )
    titleLevel -= 1
    return text + getBlankLine( 2 )


def processSection( elem ):
    """
    process section
    @param elem: section element
    """

    global titleLevel
    titleLevel += 1
    text = walk( n_FirstChild( elem ) )
    titleLevel -= 1
    return text + getBlankLine( 2 )


def processAppendix( elem ):
    """
    process appendix
    @param elem: appendix element
    """

    global titleLevel
    titleLevel += 1
    text = walk( n_FirstChild( elem ) )
    titleLevel -= 1
    return text


def processBiblioentry( elem ):
    """
    process biblioentry
    @param elem: biblioentry element
    """

    return '+ ' + getTitleContent( n_GetByTag( elem, 'title' ) ) + getBlankLine()


def processBookinfo( elem ):
    """
    process bookinfo
    @param elem: bookinfo element
    """

    text = []
    text.append( "% " + getTitleContent( n_GetByTag( elem, 'title' ) ) )
    text.append( "% " + processAuthors( elem ) )
    return '\n'.join( text ) + getBlankLine( 2 )


def processAuthors( elem ):
    """
    process authors
    @param elem: bookinfo or articleinfo element
    """

    authorNodes = n_GetsByTag( elem, 'author' )
    text = []
    for node in authorNodes:
        text.append( n_GetByTag( node, 'firstname' ).firstChild.nodeValue )
    return ', '.join( text )


def processBook( elem ):
    """
    process book element.
    @param elem: book element
    """

    info = n_GetByTag( elem, 'bookinfo' )
    text = []
    text.append( processBookinfo( info ) )
    text.append( walk( n_NextElem( info ) ) )
    text.append( '' )
    return '\n'.join( text )


def processArticle( node ):
    """
    process article element.
    @param elem: article element
    """

    pass

result = {
    'book'   : lambda n: processBook( n ),
    'article': lambda n: processArticle( n )
}[ root.tagName ]( root )
f = open( args.output, 'w' )
f.write( result.encode( 'utf-8' ) )
f.close()




