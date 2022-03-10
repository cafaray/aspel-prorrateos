use iaspel

DROP TABLE IF EXISTS ksae10t;
CREATE TABLE ksae10t (
    id int auto_increment,
    idcvesup VARCHAR(10) NOT NULL COMMENT 'CLAVE',
    dsnomsup VARCHAR(200) NOT NULL COMMENT 'NOMBRE',
    dsrfcsup VARCHAR(20) NOT NULL COMMENT 'RFC',
    dscurpsu VARCHAR(30) NOT NULL COMMENT 'CURP',
    dsctacon VARCHAR(60) NOT NULL COMMENT 'CUENTA_CONTABLE',
    idtipter INT NOT NULL COMMENT 'TIP_TERCERO',
    idtipope INT NOT NULL COMMENT 'TIP_OPERA',
    cdstatus VARCHAR(1) COMMENT 'STATUS',
    PRIMARY KEY(id)
);

CREATE UNIQUE INDEX idx_supplier USING BTREE ON ksae10t(idcvesup DESC) COMMENT 'Unique supplier';