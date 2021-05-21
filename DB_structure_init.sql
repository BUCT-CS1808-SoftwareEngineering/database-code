/*
 Navicat MySQL Data Transfer

 Source Server         : t
 Source Server Type    : MySQL
 Source Server Version : 100132
 Source Host           : localhost:3306
 Source Schema         : ttest

 Target Server Type    : MySQL
 Target Server Version : 100132
 File Encoding         : 65001

 Date: 21/05/2021 17:10:22
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin table
-- ----------------------------
DROP TABLE IF EXISTS `admin table`;
CREATE TABLE `admin table`  (
  `admin_ID` int NOT NULL AUTO_INCREMENT,
  `admin_Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `admin_Passwd` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`admin_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for attention table
-- ----------------------------
DROP TABLE IF EXISTS `attention table`;
CREATE TABLE `attention table`  (
  `att_ID` int NOT NULL AUTO_INCREMENT,
  `muse_ID` int NOT NULL,
  `user_ID` int NOT NULL,
  PRIMARY KEY (`att_ID`) USING BTREE,
  INDEX `muse_ID`(`muse_ID`) USING BTREE,
  INDEX `user_ID`(`user_ID`) USING BTREE,
  CONSTRAINT `muse_ID` FOREIGN KEY (`muse_ID`) REFERENCES `museum info table` (`muse_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_ID` FOREIGN KEY (`user_ID`) REFERENCES `user table` (`user_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for collection info table
-- ----------------------------
DROP TABLE IF EXISTS `collection info table`;
CREATE TABLE `collection info table`  (
  `col_ID` int NOT NULL AUTO_INCREMENT,
  `muse_ID` int NOT NULL,
  `col_Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `col_Intro` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `col_Photo` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`col_ID`) USING BTREE,
  INDEX `muse_ID_col`(`muse_ID`) USING BTREE,
  CONSTRAINT `muse_ID_col` FOREIGN KEY (`muse_ID`) REFERENCES `museum info table` (`muse_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for comment table
-- ----------------------------
DROP TABLE IF EXISTS `comment table`;
CREATE TABLE `comment table`  (
  `com_ID` int NOT NULL AUTO_INCREMENT,
  `user_ID` int NOT NULL,
  `muse_ID` int NOT NULL,
  `com_Info` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `com_IfShow` tinyint(1) UNSIGNED ZEROFILL NOT NULL DEFAULT 0,
  `com_Time` datetime NOT NULL,
  PRIMARY KEY (`com_ID`) USING BTREE,
  INDEX `muse_ID_com`(`muse_ID`) USING BTREE,
  INDEX `user_ID_com`(`user_ID`) USING BTREE,
  CONSTRAINT `muse_ID_com` FOREIGN KEY (`muse_ID`) REFERENCES `museum info table` (`muse_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_ID_com` FOREIGN KEY (`user_ID`) REFERENCES `user table` (`user_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for education act table
-- ----------------------------
DROP TABLE IF EXISTS `education act table`;
CREATE TABLE `education act table`  (
  `act_ID` int NOT NULL AUTO_INCREMENT,
  `muse_ID` int NOT NULL,
  `act_Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `act_Content` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `act_Time` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `act_Pic` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `act_Url` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`act_ID`) USING BTREE,
  INDEX `muse_ID_edu`(`muse_ID`) USING BTREE,
  CONSTRAINT `muse_ID_edu` FOREIGN KEY (`muse_ID`) REFERENCES `museum info table` (`muse_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for exhibition info table
-- ----------------------------
DROP TABLE IF EXISTS `exhibition info table`;
CREATE TABLE `exhibition info table`  (
  `exhib_ID` int NOT NULL AUTO_INCREMENT,
  `muse_ID` int NOT NULL,
  `exhib_Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `exhib_Content` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `exhib_Pic` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`exhib_ID`) USING BTREE,
  INDEX `muse_ID_exh`(`muse_ID`) USING BTREE,
  CONSTRAINT `muse_ID_exh` FOREIGN KEY (`muse_ID`) REFERENCES `museum info table` (`muse_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for feedback table
-- ----------------------------
DROP TABLE IF EXISTS `feedback table`;
CREATE TABLE `feedback table`  (
  `fdback_ID` int NOT NULL AUTO_INCREMENT,
  `muse_ID` int NOT NULL,
  `user_ID` int NOT NULL,
  `env_Review` int NOT NULL,
  `exhibt_Review` int NOT NULL,
  `service_Review` int NOT NULL,
  PRIMARY KEY (`fdback_ID`) USING BTREE,
  INDEX `muse_ID_fd`(`muse_ID`) USING BTREE,
  INDEX `user_ID_fd`(`user_ID`) USING BTREE,
  CONSTRAINT `muse_ID_fd` FOREIGN KEY (`muse_ID`) REFERENCES `museum info table` (`muse_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_ID_fd` FOREIGN KEY (`user_ID`) REFERENCES `user table` (`user_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for museum info table
-- ----------------------------
DROP TABLE IF EXISTS `museum info table`;
CREATE TABLE `museum info table`  (
  `muse_ID` int NOT NULL AUTO_INCREMENT,
  `muse_Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `muse_Intro` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `muse_Location` decimal(10, 6) NOT NULL,
  `muse_Address` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `muse_Opentime` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `muse_price` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `muse_class` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `muse_Ename` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `muse_VisitedTimes` int UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`muse_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 33 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for news info table
-- ----------------------------
DROP TABLE IF EXISTS `news info table`;
CREATE TABLE `news info table`  (
  `news_ID` int NOT NULL AUTO_INCREMENT,
  `muse_ID` int NOT NULL,
  `news_Name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `news_Content` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `news_type` int NOT NULL,
  `news_time` datetime NOT NULL,
  `news_source` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`news_ID`) USING BTREE,
  INDEX `muse_ID_news`(`muse_ID`) USING BTREE,
  CONSTRAINT `muse_ID_news` FOREIGN KEY (`muse_ID`) REFERENCES `museum info table` (`muse_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for review video table
-- ----------------------------
DROP TABLE IF EXISTS `review video table`;
CREATE TABLE `review video table`  (
  `video_ID` int NOT NULL AUTO_INCREMENT,
  `muse_ID` int NOT NULL,
  `user_ID` int NOT NULL,
  `video_Url` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `video_Name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `video_Time` datetime NOT NULL,
  `video_IfShow` tinyint(3) UNSIGNED ZEROFILL NOT NULL DEFAULT 000,
  `video_Description` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`video_ID`) USING BTREE,
  INDEX `muse_ID_vid`(`muse_ID`) USING BTREE,
  INDEX `user_ID_vid`(`user_ID`) USING BTREE,
  CONSTRAINT `muse_ID_vid` FOREIGN KEY (`muse_ID`) REFERENCES `museum info table` (`muse_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_ID_vid` FOREIGN KEY (`user_ID`) REFERENCES `user table` (`user_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for user table
-- ----------------------------
DROP TABLE IF EXISTS `user table`;
CREATE TABLE `user table`  (
  `user_ID` int NOT NULL AUTO_INCREMENT,
  `user_Name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_Phone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_Passwd` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_Email` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `if_com` tinyint(1) NOT NULL DEFAULT 1,
  `user_Avatar` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`user_ID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
