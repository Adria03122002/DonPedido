-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: bar_app
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ingrediente`
--
Create or Replace bar_app;
use bar_app;


DROP TABLE IF EXISTS `ingrediente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingrediente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `stock` decimal(10,0) NOT NULL DEFAULT '0',
  `unidad` varchar(255) NOT NULL DEFAULT 'unidad',
  `disponible` tinyint NOT NULL DEFAULT '1',
  `tipo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingrediente`
--

LOCK TABLES `ingrediente` WRITE;
/*!40000 ALTER TABLE `ingrediente` DISABLE KEYS */;
INSERT INTO `ingrediente` VALUES (1,'Pan de hamburguesa',25,'unidades',1,'pan'),(2,'Queso cheddar',30,'lonchas',1,'lacteo'),(3,'Carne de ternera',20,'porciones',1,'carne'),(4,'Lechuga',100,'hojas',1,'vegetal'),(5,'Tomate',60,'rodajas',1,'vegetal'),(6,'Cerveza',100,'botellas',1,'alcohol'),(7,'Cola',80,'latas',1,'refrescos');
/*!40000 ALTER TABLE `ingrediente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lineapedido`
--

DROP TABLE IF EXISTS `lineapedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lineapedido` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cantidad` int NOT NULL,
  `modificacion` varchar(255) DEFAULT NULL,
  `productoId` int DEFAULT NULL,
  `pedidoId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_3415be20903254d1b15448b2ff0` (`pedidoId`),
  CONSTRAINT `FK_3415be20903254d1b15448b2ff0` FOREIGN KEY (`pedidoId`) REFERENCES `pedido` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lineapedido`
--

LOCK TABLES `lineapedido` WRITE;
/*!40000 ALTER TABLE `lineapedido` DISABLE KEYS */;
INSERT INTO `lineapedido` VALUES (79,2,'',4,38),(80,2,'',2,38),(81,1,'',3,38),(82,2,'',1,38),(83,1,'',2,39);
/*!40000 ALTER TABLE `lineapedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estado` varchar(255) NOT NULL DEFAULT 'en preparación',
  `fecha` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ubicacionId` int DEFAULT NULL,
  `pagado` tinyint(1) DEFAULT '0',
  `formaPago` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ab805475b11103e34b42ef7bd59` (`ubicacionId`),
  CONSTRAINT `FK_ab805475b11103e34b42ef7bd59` FOREIGN KEY (`ubicacionId`) REFERENCES `ubicacion` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
INSERT INTO `pedido` VALUES (38,'en preparación','2025-10-26 19:11:33.209000',0.00,16,0,NULL),(39,'en preparación','2025-10-26 19:25:51.128000',0.00,1,0,NULL);
/*!40000 ALTER TABLE `pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `precio` decimal(10,0) NOT NULL,
  `imagenUrl` varchar(255) NOT NULL,
  `disponible` tinyint NOT NULL DEFAULT '1',
  `stock` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'Hamburguesa clásica','comida',10,'hamburguesa.jpg',1,NULL),(2,'Hamburguesa doble','comida',9,'doble.jpg',1,NULL),(3,'Cerveza','bebida',2,'cerveza.jpg',1,NULL),(4,'Cola','bebida',2,'cola.jpg',1,NULL),(16,'','',0,'',1,NULL);
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productoingrediente`
--

DROP TABLE IF EXISTS `productoingrediente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productoingrediente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cantidadNecesaria` int NOT NULL DEFAULT '1',
  `productoId` int DEFAULT NULL,
  `ingredienteId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_7930de6b550e9fe4f07b4354bb9` (`productoId`),
  KEY `FK_5fa07200ce7ed708a5bc3b311de` (`ingredienteId`),
  CONSTRAINT `FK_5fa07200ce7ed708a5bc3b311de` FOREIGN KEY (`ingredienteId`) REFERENCES `ingrediente` (`id`),
  CONSTRAINT `FK_7930de6b550e9fe4f07b4354bb9` FOREIGN KEY (`productoId`) REFERENCES `producto` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productoingrediente`
--

LOCK TABLES `productoingrediente` WRITE;
/*!40000 ALTER TABLE `productoingrediente` DISABLE KEYS */;
INSERT INTO `productoingrediente` VALUES (145,1,1,1),(146,1,1,2),(147,1,1,3),(148,1,1,4),(149,1,1,5),(150,1,2,1),(151,2,2,2),(152,2,2,3),(153,1,2,4),(154,1,2,5),(155,1,3,6),(156,1,4,7),(157,1,1,2),(158,1,1,1),(159,1,1,4),(160,1,1,3),(161,1,1,5);
/*!40000 ALTER TABLE `productoingrediente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicacion`
--

DROP TABLE IF EXISTS `ubicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(255) NOT NULL,
  `numero` int DEFAULT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'libre',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicacion`
--

LOCK TABLES `ubicacion` WRITE;
/*!40000 ALTER TABLE `ubicacion` DISABLE KEYS */;
INSERT INTO `ubicacion` VALUES (1,'mesa',1,'libre'),(2,'mesa',2,'libre'),(16,'mesa',3,'libre'),(17,'mesa',4,'libre'),(18,'mesa',5,'libre'),(19,'mesa',6,'libre'),(20,'mesa',7,'libre'),(21,'mesa',8,'libre'),(22,'mesa',9,'libre'),(23,'mesa',10,'libre'),(24,'mesa',11,'libre'),(25,'mesa',12,'libre');
/*!40000 ALTER TABLE `ubicacion` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-05 21:35:31
