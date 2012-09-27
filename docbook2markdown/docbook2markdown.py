# -*- coding:utf-8 -*-

""" 
docbook2markdown

@version 0.9
@author U{errorrik<mailto:errorrik@gmail.com>}
"""

import argparse
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


def getTitleContent( elem ):
    """
    get title content
    @param elem: title element
    """

    return elem.firstChild.nodeValue


def processTitle( elem ):
    """
    process title element. title level will auto match.
    @param elem: title element
    """

    i = 0
    prefix = ''
    while i < titleLevel:
        i += 1
        prefix += '#'

    return '\n\n' + prefix + ' ' + getTitleContent( elem ) + '\n\n'


def walk( start ):
    """
    walk and process element
    @param start: element which is the first
    """

    text = []

    while True:
        if start == None:
            break;

        text.append( {
            'chapter': lambda n: processChapter( n ),
            'section': lambda n: processSection( n ),
            'para': lambda n: processPara( n ),
            'title': lambda n: processTitle( n ),
            'table': lambda n: processTable( n ),
            'important': lambda n: processImportant( n ),
            'example': lambda n: processExample( n ),
            'appendix': lambda n: processAppendix( n ),
            'programlisting': lambda n: processProgramlisting( n )
        }[ start.tagName ]( start ) )

        start = n_NextElem( start )

    return ''.join( text )



def processImportant( elem ):
    """
    process important
    @param elem: important element
    """

    return '**' + elem.firstChild.nodeValue + '**'


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

    return '\t' + elem.firstChild.nodeValue.replace( '\n', '\t\n' )


def getEntryContent( elem ):
    """
    get entry content
    @param elem: entry element
    """

    return elem.firstChild.nodeValue


def processThead( elem ):
    """
    process thead
    @param elem: thead element
    """

    entrys = n_GetsByTag( elem, 'entry' )
    text = []
    for entry in entrys:
        text.append( getEntryContent( entry ) )
    return '|* ' + ' *|* '.join( text ) + ' *|\n'


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
    text.append( processTitle( n_GetByTag( elem, 'title' ) ) )
    text.append( processThead( n_GetByTag( elem, 'thead' ) ) )
    text.append( processTbody( n_GetByTag( elem, 'tbody' ) ) )
    return ''.join( text ) + '\n'


def processPara( elem ):
    """
    process para
    @param elem: para element
    """

    return '\n' + elem.firstChild.nodeValue + '\n'


def processChapter( elem ):
    """
    process chapter
    @param elem: chapter element
    """

    global titleLevel
    titleLevel += 1
    text = walk( n_FirstChild( elem ) )
    titleLevel -= 1
    return text


def processSection( elem ):
    """
    process section
    @param elem: section element
    """

    global titleLevel
    titleLevel += 1
    text = walk( n_FirstChild( elem ) )
    titleLevel -= 1
    return text


def processAppendix( elem ):
    """
    process appendix
    @param elem: appendix element
    """

    return ''



def processBookinfo( elem ):
    """
    process bookinfo
    @param elem: bookinfo element
    """

    text = []
    text.append( "% " + getTitleContent( n_GetByTag( elem, 'title' ) ) )
    text.append( "% " + processAuthors( elem ) )
    text.append( '' )
    text.append( '' )
    return '\n'.join( text )


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
    print '\n'.join( text )


def processArticle( node ):
    """
    process article element.
    @param elem: article element
    """

    pass

{
    'book'   : lambda n: processBook( n ),
    'article': lambda n: processArticle( n )
}[ root.tagName ]( root )



