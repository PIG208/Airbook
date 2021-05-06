SELECT 'Dropping existing airbook database and user.' AS '';
DROP USER IF EXISTS 'airbook_admin'@'localhost';
DROP DATABASE IF EXISTS airbook;

SELECT 'Creating airbook_admin and the database.' AS '';
CREATE USER 'airbook_admin'@'localhost' IDENTIFIED BY 'Airbook_admin_x7fo1a';
CREATE DATABASE airbook;
GRANT ALL PRIVILEGES ON airbook.* TO 'airbook_admin'@'localhost';
SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
FLUSH PRIVILEGES;