# !/bin/bush
#Alpha Version
mysqldump -uUsername -pPassword --single-transaction --flush-logs --master-data=2 --databases MuseumDB --delete-master-logs >/.../full_backup.sql