-- Tabela usuario
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    data_nascimento DATE,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('ADMIN', 'CONSELHEIRO', 'USUARIO_COMUM')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ATIVO', 'INATIVO', 'BLOQUEADO'))
);

-- Tabela conselheiro
CREATE TABLE conselheiro (
    id_conselheiro SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    area_atuacao VARCHAR(100),
    registro_profissional VARCHAR(50)
);

-- Tabela administrador
CREATE TABLE administrador (
    id_administrador SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    nivel_acesso VARCHAR(20) CHECK (nivel_acesso IN ('MASTER', 'ADMIN', 'MODERADOR')),
    cargo VARCHAR(100)
);

-- Tabela solicitacao
CREATE TABLE solicitacao (
    id_solicitacao SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    data_abertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    o_que TEXT,
    por_que TEXT,
    onde TEXT,
    quando TEXT,
    como TEXT,
    quanto TEXT,
    impacto TEXT,
    observacao TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDENTE', 'EM_AVALIACAO', 'APROVADA', 'REPROVADA', 'CANCELADA'))
);

-- Tabela voto_conselheiro
CREATE TABLE voto_conselheiro (
    id_voto SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_conselheiro INTEGER NOT NULL REFERENCES conselheiro(id_conselheiro),
    id_solicitacao INTEGER NOT NULL REFERENCES solicitacao(id_solicitacao),
    voto VARCHAR(20) NOT NULL CHECK (voto IN ('APROVADO', 'REPROVADO', 'ABSTENCAO')),
    parecer TEXT,
    data_voto TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela decisao_final
CREATE TABLE decisao_final (
    id_decisao SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_administrador INTEGER NOT NULL REFERENCES administrador(id_administrador),
    id_solicitacao INTEGER NOT NULL UNIQUE REFERENCES solicitacao(id_solicitacao),
    resultado VARCHAR(20) NOT NULL CHECK (resultado IN ('APROVADO', 'REPROVADO', 'CANCELADO')),
    justificativa TEXT,
    data_decisao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX idx_solicitacao_status ON solicitacao(status);
CREATE INDEX idx_solicitacao_usuario ON solicitacao(id_usuario);
CREATE INDEX idx_voto_solicitacao ON voto_conselheiro(id_solicitacao);
CREATE INDEX idx_voto_conselheiro ON voto_conselheiro(id_conselheiro);
CREATE INDEX idx_decisao_solicitacao ON decisao_final(id_solicitacao);
