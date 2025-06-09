import { fastify } from "fastify";
import { PrismaClient } from "@prisma/client";
import fastifyJwt from "fastify-jwt";
import fastifyBcrypt from "fastify-bcrypt";
import fastifyCors from "fastify-cors";
import dotenv from "dotenv";

dotenv.config();

const server = fastify({ logger: true });
const prisma = new PrismaClient();

server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET
});

server.register(fastifyBcrypt);

server.register(fastifyCors, {
  origin: true,
  allowedHeaders: ["Content-Type", "Authorization"]
});

// Middleware de autenticação
server.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (error) {
    server.log.error(error);
    return reply
      .status(401)
      .send({ success: false, error: true, message: "Não autorizado" });
  }
});

//------------------------------------------------------------Rotas para CRUD do administrador------------------------------------------------------


// Rota para pegar os dados do admin

server.get("/admin/me", {
  preHandler: [server.authenticate], // middleware para verificar o token
  handler: async (request, reply) => {
     console.log("Usuário autenticado:", request.user); // <- veja o que chega aquD
    try {
      const adminId = request.user.id;

      const admin = await prisma.administrador.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          nome: true,
          id_card: true,
        },
      });

      if (!admin) {
        return reply.status(404).send({ message: "Administrador não encontrado" });
      }

      return reply.send(admin);
    } catch (error) {
      console.error("Erro ao buscar administrador:", error);
      return reply.status(500).send({ message: "Erro interno do servidor" });
    }
  }
});

// Rota para mostrar os administradores

server.get(
  "/administradores",
  {
    preHandler: [server.authenticate],
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            error: { type: "boolean" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  nome: { type: "string" },
                  id_card: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  },
  async (request, reply) => {
    try {
      const administradores = await prisma.administrador.findMany();

      if (!administradores || administradores.length === 0) {
        return reply.status(404).send({
          success: false,
          error: true,
          message: "Nenhum administrador encontrado"
        });
      }

      return reply.status(200).send({
        success: true,
        error: false,
        data: administradores
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

// Rota de cadastro
server.post(
  "/register",
  {
    schema: {
      body: {
        type: "object",
        properties: {
          nome: { type: "string" },
          senha: { type: "string" },
          id_card: { type: "string" }
        },
        required: ["nome", "senha"]
      }
    }
  },
  async (request, reply) => {
    const { nome, senha, id_card } = request.body;

    if (!nome || !senha) {
      return reply.status(400).send({
        success: false,
        error: true,
        message: "Nome e senha são obrigatórios"
      });
    }

    const existingUser = await prisma.administrador.findFirst({
      where: { nome }
    });

    if (existingUser) {
      return reply.status(409).send({
        success: false,
        error: true,
        message: "Usuário já existente"
      });
    }

    const hashedPassword = await server.bcrypt.hash(senha, 10);
    const newUser = await prisma.administrador.create({
      data: { nome, senha: hashedPassword, id_card }
    });

    const token = server.jwt.sign({ id: newUser.id });

    return reply.status(201).send({
      success: true,
      error: false,
      message: "Cadastro realizado com sucesso",
      token
    });
  }
);

// Rota de login
server.post(
  "/login",
  {
    schema: {
      body: {
        type: "object",
        properties: {
          nome: { type: "string" },
          senha: { type: "string" }
        },
        required: ["nome", "senha"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { nome, senha } = request.body;

      if (!nome || !senha) {
        return reply.status(400).send({
          success: false,
          error: true,
          message: "Nome e senha são obrigatórios"
        });
      }

      const user = await prisma.administrador.findFirst({ where: { nome } });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: true,
          message: "Usuário não encontrado"
        });
      }

      const isPasswordValid = await server.bcrypt.compare(senha, user.senha);

      if (!isPasswordValid) {
        return reply.status(401).send({
          success: false,
          error: true,
          message: "Usuário ou senha incorreta!"
        });
      }

      const token = server.jwt.sign({ id: user.id });

      return reply.status(200).send({
        success: true,
        error: false,
        message: "Login efetuado com sucesso",
        token
      });
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

//--Rota para Atualização

server.put(
  "/perfil/:id",
  {
    preHandler: [server.authenticate],
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" }
        },
        required: ["id"]
      },
      body: {
        type: "object",
        properties: {
          nome: { type: "string" },
          senha: { type: "string" }
        },
        required: ["nome", "senha"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { id } = request.params;
      const { nome, senha } = request.body;

      const existingAdmin = await prisma.administrador.findFirst({
        where: { id: Number(id) }
      });

      if (!existingAdmin) {
        return reply.status(404).send({
          success: false,
          error: true,
          message: "Conta não encontrada!"
        });
      }

      const admin = await prisma.administrador.update({
        where: { id: Number(id) },
        data: { nome, senha }
      });

      return reply.status(200).send({
        success: true,
        error: false,
        message: "Conta atualizada com sucesso",
        admin
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

//--Rota para remoção

server.delete(
  "/perfil/:id",
  {
    preHandler: [server.authenticate],
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" }
        },
        required: ["id"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { id } = request.params;

      const existingAdmin = await prisma.administrador.findFirst({
        where: { id: Number(id) }
      });

      if (!existingAdmin) {
        return reply.status(404).send({
          success: false,
          error: true,
          message: "Conta não encontrada!"
        });
      }

      const admin = await prisma.administrador.delete({
        where: { id: Number(id) }
      });

      return reply.status(200).send({
        success: true,
        error: false,
        message: "Conta removida com sucesso!",
        admin
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

//------------------------------------------------------------Rotas para CRUD de Alunos----------------------------------------------------------

// Rota para listar todos os alunos
server.get(
  "/alunos",
  {
    preHandler: [server.authenticate],
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            error: { type: "boolean" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  nome: { type: "string" },
                  telefone: { type: "number" },
                  sala: { type: "number" },
                  turno: { type: "string" },
                  id_card: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  },
  async (request, reply) => {
    try {
      const alunos = await prisma.aluno.findMany();

      if (!alunos || alunos.length === 0) {
        return reply.status(404).send({
          success: false,
          error: true,
          message: "Nenhum aluno encontrado"
        });
      }

      return reply.status(200).send({
        success: true,
        error: false,
        data: alunos
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

// Rota para criar novo aluno
server.post(
  "/aluno",
  {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: "object",
        properties: {
          nome: { type: "string" },
          telefone: { type: "number" },
          sala: { type: "number" },
          turno: { type: "string" },
          id_card: { type: "string" }
        },
        required: ["nome", "telefone", "sala", "turno", "id_card"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { nome, telefone, sala, turno, id_card } = request.body;

      const existingStudent = await prisma.aluno.findFirst({
        where: {
          OR: [{ nome }, { telefone }, { id_card }]
        }
      });

      if (existingStudent) {
        return reply.status(409).send({
          success: false,
          error: true,
          message: "Aluno já cadastrado"
        });
      }

      const aluno = await prisma.aluno.create({
        data: { nome, telefone, sala, turno, id_card }
      });

      return reply.status(201).send({
        success: true,
        error: false,
        message: "Aluno cadastrado com sucesso",
        aluno
      });
      
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

// Rota para atualizar
server.put(
  "/aluno/:id",
  {
    preHandler: [server.authenticate],
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" }
        },
        required: ["id"]
      },
      body: {
        type: "object",
        properties: {
          nome: { type: "string" },
          telefone: { type: "number" },
          sala: { type: "number" },
          turno: { type: "string" },
          id_card: { type: "string" } // 👈 Novo campo permitido
        },
        required: ["nome", "telefone", "sala", "turno", "id_card"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { id } = request.params;
      const { nome, telefone, sala, turno, id_card } = request.body;

      const existingStudent = await prisma.aluno.findUnique({
        where: { id: Number(id) }
      });

      if (!existingStudent) {
        return reply.status(404).send({
          success: false,
          error: true,
          message: "Aluno não encontrado"
        });
      }

      const aluno = await prisma.aluno.update({
        where: { id: Number(id) },
        data: { nome, telefone, sala, turno, id_card }
      });

      return reply.status(200).send({
        success: true,
        error: false,
        message: "Aluno atualizado com sucesso",
        aluno
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

// Rota para remover
server.delete(
  "/aluno/:id",
  {
    preHandler: [server.authenticate],
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" }
        },
        required: ["id"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { id } = request.params;

      const existingStudent = await prisma.aluno.findFirst({
        where: { id: Number(id) }
      });

      if (!existingStudent) {
        return reply.status(404).send({
          success: false,
          error: true,
          message: "Aluno não encontrado"
        });
      }

      const aluno = await prisma.aluno.delete({
        where: { id: Number(id) }
      });

      return reply.status(200).send({
        success: true,
        error: false,
        message: "Aluno removido com sucesso",
        aluno
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

//----------------------------------------------Rota para CRUD de remedios--------------------------------------------------

// Rota para listar todos os remédios
server.get(
  "/remedios",
  {
    preHandler: [server.authenticate],
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            error: { type: "boolean" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  nome: { type: "string" },
                  categoria: { type: "string" },
                  quantidade: { type: "number" },
                  validade: { type: "string" }
                }
              }
            },
            message: { type: "string" } // Adicione se quiser incluir mensagem no 200
          }
        }
      }
    }
  },
  async (request, reply) => {
    try {
      const remedios = await prisma.remedio.findMany();

      if (!remedios || remedios.length === 0) {
        return reply.status(201).send({
          success: true,
          error: false,
          data: [],
          message: "Nenhum remédio encontrado"
        });
      }

      return reply.status(200).send({
        success: true,
        error: false,
        data: remedios
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

// Rota para adicionar novo remédio
server.post(
  "/remedio",
  {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: "object",
        properties: {
          nome: { type: "string" },
          quantidade: { type: "number" },
          categoria: { type: "string" },
          validade: { type: "string" }
        },
        required: ["nome", "quantidade", "categoria", "validade"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { nome, quantidade, categoria, validade } = request.body;

      const existingMedicines = await prisma.remedio.findFirst({
        where: {
          OR: [{ nome }, { categoria }]
        }
      });

      if (existingMedicines) {
        return reply.status(409).send({
          success: false,
          error: true,
          message: "Remédio já existente"
        });
      }

      const remedio = await prisma.remedio.create({
        data: {
          nome,
          quantidade,
          categoria,
          validade: new Date(validade) // <- Aqui
        }
      });

      return reply.status(201).send({
        success: true,
        error: false,
        message: "Remédio adicionado com sucesso!",
        remedio
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

// Rota para atualização
server.put(
  "/remedio/:id",
  {
    preHandler: [server.authenticate],
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" }
        },
        required: ["id"]
      },
      body: {
        type: "object",
        properties: {
          nome: { type: "string" },
          categoria: { type: "string" },
          quantidade: { type: "number" }
        },
        required: ["nome", "categoria", "quantidade"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { id } = request.params;
      const { nome, categoria, quantidade } = request.body;

      const existingMedicines = await prisma.remedio.findFirst({
        where: { id: Number(id) }
      });

      if (!existingMedicines) {
        return reply.status(404).send({
          success: false,
          error: true,
          message: "Remédio não encontrado"
        });
      }

      const remedio = await prisma.remedio.update({
        where: { id: Number(id) },
        data: { nome, categoria, quantidade }
      });

      return reply.status(200).send({
        success: true,
        error: false,
        message: "Remédio atualizado com sucesso!",
        remedio
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

// Rota para remover
server.delete(
  "/remedio/:id",
  {
    preHandler: [server.authenticate],
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" }
        },
        required: ["id"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { id } = request.params;

      const existingMedicines = await prisma.remedio.findFirst({
        where: { id: Number(id) }
      });

      if (!existingMedicines) {
        return reply.status(404).send({
          success: false,
          error: true,
          message: "Remédio não encontrado"
        });
      }

      const remedio = await prisma.remedio.delete({
        where: { id: Number(id) }
      });

      return reply.status(200).send({
        success: true,
        error: false,
        message: "Remédio removido com sucesso!",
        remedio
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        error: true,
        message: "Algo deu errado. Tente novamente."
      });
    }
  }
);

server.get("/dashboard/summary", async (request, reply) => {
  try {
    const totalRemedios = await prisma.remedio.count();

    const dataAtual = new Date();
    const remediosVencidos = await prisma.remedio.count({
      where: {
        validade: {
          lt: dataAtual
        }
      }
    });

    const totalTransacoes = await prisma.transacao.count();

    const remediosBaixoEstoque = await prisma.remedio.count({
      where: {
        quantidade: {
          lt: 5
        }
      }
    });

    const totalAlunos = await prisma.aluno.count();

    const alunosRecentes = await prisma.aluno.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    return {
      totalRemedios,
      remediosVencidos,
      totalTransacoes,
      remediosBaixoEstoque,
      totalAlunos,
      alunosRecentes
    };
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({ error: "Erro ao buscar dados do dashboard" });
  }
});

server.get("/transacao", async (request, reply) => {
  try {
    const transacoes = await prisma.transacao.findMany({
      orderBy: {
        hora: "desc",
      },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            id_card: true,
          },
        },
        remedio: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    const respostaFormatada = transacoes.map((transacao) => ({
  id: transacao.id,
  hora: transacao.hora.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
  quantidade: transacao.quantidade,
  slot: transacao.slot,
  status: transacao.status,
  usuario: transacao.aluno.nome,
  id_card: transacao.aluno.id_card,
  medicamento: transacao.remedio.nome,
}));

    return reply.send(respostaFormatada);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return reply.status(500).send({ erro: "Erro interno ao buscar transações" });
  }
});


//------------------------------------------------------( Rota para receber dados do ESP32 )-------------------------------------------------------

  server.post("/transacao", async (request, reply) => {
    const {
      hora,
      medicamento,
      quantidade,
      slot,
      usuario,
      status,
    } = request.body;

    try {
      // Buscar aluno pelo id_card (usuario)
      const aluno = await prisma.aluno.findUnique({
        where: { id_card: usuario },
      });

      if (!aluno) {
        return reply.status(404).send({ erro: "Aluno não encontrado" });
      }

      // Buscar remedio pelo nome
      const remedio = await prisma.remedio.findFirst({
        where: { nome: medicamento },
      });

      if (!remedio) {
        return reply.status(404).send({ erro: "Remédio não encontrado" });
      }

      // Criar transação no banco
      const transacao = await prisma.transacao.create({
        data: {
          hora: new Date(),
          quantidade,
          slot,
          status,
          alunoId: aluno.id,
          remedioId: remedio.id,
        },
      });

     return reply.status(201).send({
  mensagem: "Transação registrada com sucesso",
  transacao,
  aluno: {
    id: aluno.id,
    nome: aluno.nome,
    id_card: aluno.id_card
  },
  remedio: {
    id: remedio.id,
    nome: remedio.nome
  }
});
    } catch (error) {
      console.error("Erro ao registrar transação:", error);
      return reply.status(500).send({ erro: "Erro interno no servidor" });
    }
  });


// ------------------------------------------------------ Inicialização do servidor ------------------------------------------------------
server.listen({ port: 3333, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }

  server.log.info(`Servidor rodando em ${address}`);
});
