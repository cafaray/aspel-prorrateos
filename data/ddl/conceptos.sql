use iaspel
-- table to sabe conceptos related
DROP TABLE IF EXISTS ksae40t;
CREATE TABLE ksae40t (
    id int auto_increment,
    idnumcto INT NOT NULL COMMENT 'NUM_CPTO',
    dsnomcto VARCHAR(200) NOT NULL COMMENT 'DESCR',
    dstipcto VARCHAR(2) NOT NULL COMMENT 'TIPO',
    dsctacon VARCHAR(60) NOT NULL  COMMENT 'CUEN_CONT',
    inautori VARCHAR(2) NOT NULL COMMENT 'AUTORIZACION',
    insigno INT NOT NULL COMMENT 'SIGNO',
    cdstatus VARCHAR(1) COMMENT 'STATUS',
    PRIMARY KEY(id)
);

CREATE UNIQUE INDEX idx_concept USING BTREE ON ksae40t(idnumcto DESC) COMMENT 'Unique concept';