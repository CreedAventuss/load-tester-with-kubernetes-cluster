DROP DATABASE IF EXISTS NetControlDB;
CREATE DATABASE IF NOT EXISTS NetControlDB;
USE NetControlDB;

CREATE TABLE users (
    idUser INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(15) NOT NULL,
    surname VARCHAR(15) NOT NULL,
    username VARCHAR(25) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    birthDate DATE NOT NULL,
    password VARCHAR(255) NOT NULL,
    registerDate DATE NOT NULL
);

CREATE TABLE payments (
    idPayment INT PRIMARY KEY AUTO_INCREMENT,
    idUser INT,
    import INT NOT NULL,
    paymentDate DATE NOT NULL,
    FOREIGN KEY (IdUser) REFERENCES users(IdUser)
);

CREATE TABLE history (
    idTest INT PRIMARY KEY AUTO_INCREMENT,
    idUser INT,
    URL VARCHAR(200) NOT NULL,
    testDate DATE NOT NULL,
    FOREIGN KEY (IdUser) REFERENCES users(IdUser)
);

CREATE TABLE loginLogs (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    idUser INT,
    timeStamp DATE,
    stauts VARCHAR(15),
    inputusername VARCHAR(50),
    FOREIGN KEY (idUser) REFERENCES users(IdUser)
);

CREATE TABLE registerLogs (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    idUser INT,
    timeStamp DATE,
    FOREIGN KEY (idUser) REFERENCES users(IdUser)
);

CREATE TABLE deleteLogs (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    idUser INT,
    timeStamp DATE,
    FOREIGN KEY (idUser) REFERENCES users(IdUser)
);

CREATE TABLE passwordChangesLogs (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    isUser INT,
    timeStamp DATE,
    FOREIGN KEY (idUser) REFERENCES users(IdUser)
)

CREATE TABLE usernameChangesLogs (
    logID INT PRIMARY KEY AUTO_INCREMENT,
    idUser INT,
    oldUsername VARCHAR(50) NOT NULL,
    newUsername VARCHAR(50) NOT NULL,
    timeStamp DATE,
    FOREIGN KEY (idUser) REFERENCES users(IdUser)
)