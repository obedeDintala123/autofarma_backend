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
  allowedHeaders: ['Content-Type', 'Authorization'],
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

// Rota de cadastro 
server.post('/register',  {
  schema: {
    body: {
      type: "object",
      properties: {
        nome: { type: "string" },
        senha: { type: "string" },
        id_card: { type: "string" }
      },
      required: ["nome", "senha", "id_card"]
    }
  }
}, async (request, reply) => {
  const { nome, senha, id_card } = request.body;

  if (!nome || !senha) {
    return reply.status(400).send({
      success: false,
      error: true,
      message: "Nome e senha são obrigatórios",
    });
  }

  const existingUser = await prisma.administrador.findFirst({ where: { nome } });

  if (existingUser) {
    return reply.status(409).send({
      success: false,
      error: true,
      message: "Usuário já existente",
    });
  }

  const hashedPassword = await server.bcrypt.hash(senha, 10);
  const newUser = await prisma.administrador.create({
    data: { nome, senha: hashedPassword, id_card },
  });

  const token = server.jwt.sign({ id: newUser.id });

  return reply.status(201).send({
    success: true,
    error: false,
    message: "Cadastro realizado com sucesso",
    token,
  });
});

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
          message: "Nome e senha são obrigatórios",
        });
      }

      const user = await prisma.administrador.findFirst({ where: { nome } });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: true,
          message: "Usuário não encontrado",
        });
      }

      const isPasswordValid = await server.bcrypt.compare(senha, user.senha);

      if (!isPasswordValid) {
        return reply.status(401).send({
          success: false,
          error: true,
          message: "Usuário ou senha incorreta!",
        });
      }

      const token = server.jwt.sign({ id: user.id });

      return reply.status(200).send({
        success: true,
        error: false,
        message: "Login efetuado com sucesso",
        token,
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
          senha: { type: "string" },
        },
        required: ["nome", "senha"],
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

      const existingAdmin= await prisma.administrador.findFirst({
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



//---------------------------------------Rotas para CRUD de Alunos----------------------------------------------------------


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
                  turno: { type: "string" }
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
  "/aluno/register",
  {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: "object",
        properties: {
          nome: { type: "string" },
          telefone: { type: "number" },
          sala: { type: "number" },
          turno: { type: "string" }
        },
        required: ["nome", "telefone", "sala", "turno"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { nome, telefone, sala, turno } = request.body;

      const existingStudent = await prisma.aluno.findFirst({
        where: {
          OR: [{ nome }, { telefone }]
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
        data: { nome, telefone, sala, turno }
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
          turno: { type: "string" }
        },
        required: ["nome", "telefone", "sala", "turno"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { id } = request.params;
      const { nome, telefone, sala, turno } = request.body;

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

      const aluno = await prisma.aluno.update({
        where: { id: Number(id) },
        data: { nome, telefone, sala, turno }
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
                  uso: { type: "string" },
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
          uso: { type: "string" },
          validade: { type: "string", format: "date" } // <- Aqui
        },
        required: ["nome", "quantidade", "uso", "validade"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { nome, quantidade, uso, validade } = request.body;

      const existingMedicines = await prisma.remedio.findFirst({
        where: {
          OR: [{ nome }, { uso }]
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
          uso,
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
          uso: { type: "string" },
        },
        required: ["nome", "categoria", "uso"]
      }
    }
  },
  async (request, reply) => {
    try {
      const { id } = request.params;
      const { nome, categoria, uso } = request.body;

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
        data: { nome, categoria, uso }
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



//------------------------------------------------------( Rota para receber dados do ESP32 )-------------------------------------------------------

server.post('/api/receber-dados', async (request, reply) => {
  const { sensor, valor } = request.body;

  console.log(`Sensor: ${sensor} | Valor: ${valor}`);

  return { mensagem: 'Dados recebidos com sucesso', sensor, valor };
});



// -------------------------------------------- Rotas para receber dados de remedios------------------------------------------------------------
server.post('/api/remedios-vencidos', async (request, reply) => {
 
});

server.post('/api/remedios-baixo-estoque', async (request, reply) => {
 
});

// --------------------------------------------------------------- Rota para alertas -------------------------------------------------------------
server.post('/api/alertas', async (request, reply) => {
 
});

// ------------------------------------------------------------- Rota para notificações ----------------------------------------------------------
server.post('/api/notificacoes', async (request, reply) => {
 
});

// ------------------------------------------------------ Inicialização do servidor ------------------------------------------------------
server.listen({ port: 3333 }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }

  server.log.info(`Servidor rodando em ${address}`);
});
