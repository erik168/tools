#! /bin/sh


if [ "X$1" = "X--help" ]
then
    echo "Usage: ./whocommitted.sh -b 'beginDate' -e 'endDate' -d 'file or directory'"
    echo ""
    exit 1;
fi

while getopts b:e:d: opt
do
    case $opt in
        b) beginDate=$OPTARG ;;
        e) endDate=$OPTARG ;;
        d) dir=$OPTARG ;;
    esac
done

if [ "X${beginDate}" = "X" ]
then
    echo "Error: beginDate has not assigned."
    exit 1
fi


if [ "X${endDate}" = "X" ]
then
    echo "Error: endDate has not assigned."
    exit 1
fi


if [ "X${dir}" = "X" ]
then
    dir=$(dirname $0)
fi

TEMP_FILE=".temp$$"

processFile() {
    svn log  -r "{${beginDate}}:{${endDate}}" $1 | 
        awk -F "|" 'BEGIN{OFS=","}NF>3{print $2,$3;}' | 
            sort -t "," -k 1,1 -k 2r |  sort -t "," -u -k 1,1
}


if [ -f ${dir} ]
then
    echo ${dir}
    processFile ${dir}
    echo ""
elif [ -d ${dir} ]
then
    for file in $(find ${dir} -type f | grep -v ".svn")
    do
        processFile ${file} > "${TEMP_FILE}"
        if [ $(wc -l ${TEMP_FILE} | awk '{print $1}') -gt 0 ]
        then
            echo $file
            cat "${TEMP_FILE}"
            echo ""
        fi
        rm -f "${TEMP_FILE}"
    done
fi


