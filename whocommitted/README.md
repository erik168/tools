whocommitted.sh
==================


该工具可用于查找在一定时间段内提交过相应文件的人。
每个修改人只保留一行，其中日期为该人最后提交日期。

	./whocommitted.sh -b 'beginDate' -e 'endDate' -d 'file or directory'

+ -b和-e参数的日期格式为yyyy-MM-dd
+ -d参数可为单一文件，也可为目录

### 普通例子

	./whocommitted.sh -b '2012-12-01' -e '2012-12-04' -d .

### 结果输出到文件

	./whocommitted.sh -b '2012-12-01' -e '2012-12-04' -d . > whocommitted.txt
