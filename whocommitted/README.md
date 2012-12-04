whocommitted.sh
==================


该工具用于跟踪svn log，查找在一定时间段内提交过相应文件的人。
对于每一个文件，每位修改人只保留一行，其中日期为该人最后提交日期。

	./whocommitted.sh -b 'beginDate' -e 'endDate' -d 'file or directory'

+ -b和-e参数的日期格式为yyyy-MM-dd
+ -d参数可为单一文件，也可为目录

### 查看目录所有文件修改人

	./whocommitted.sh -b '2012-12-01' -e '2012-12-04' -d project_dir

### 查看单一文件修改人

	./whocommitted.sh -b '2012-12-01' -e '2012-12-04' -d test.js

### 结果输出到文件

	./whocommitted.sh -b '2012-12-01' -e '2012-12-04' -d . > whocommitted.txt
