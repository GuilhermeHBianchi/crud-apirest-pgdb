import { Request, Response } from "express";
import fornecedorController from "../../controllers/fornecedor.controller.ts";
import fornecedorRepository from "../../repository/fornecedor.repository.ts";

jest.mock("../../repository/fornecedor.repository", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findByCnpj: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockRequestResponse = (reqOverrides: Partial<Request> = {}) => {
  const req: Partial<Request> = {
    params: {},
    body: {},
    ...reqOverrides,
  };

  const res: Partial<Response> = {
    status: jest.fn(function (this: Response) {
      return this;
    }),
    json: jest.fn(),
  };

  return { req: req as Request, res: res as Response };
};

describe("FornecedorController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- CREATE ----------------
  describe("createFornecedor", () => {
    it("deve retornar erro 500 em caso de exceção", async () => {
      const { req, res } = mockRequestResponse({
        body: { nome: "Fornecedor A", cnpj: "123456789" },
      });

      (fornecedorRepository.findByCnpj as jest.Mock).mockRejectedValue(
        new Error("DB error")
      );

      await fornecedorController.createFornecedor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao criar fornecedor",
        details: "DB error",
      });
    });
  });

  // ---------------- GET ALL ----------------
  describe("getAllFornecedores", () => {
    it("deve retornar erro 500 em caso de exceção", async () => {
      (fornecedorRepository.findAll as jest.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const { req, res } = mockRequestResponse();

      await fornecedorController.getAllFornecedores(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao buscar fornecedores",
        details: "DB error",
      });
    });
  });

  // ---------------- GET BY ID ----------------
  describe("getFornecedorById", () => {
    it("deve retornar erro 500 em caso de exceção", async () => {
      (fornecedorRepository.findById as jest.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const { req, res } = mockRequestResponse({ params: { id: "1" } });

      await fornecedorController.getFornecedorById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao buscar fornecedor",
        details: "DB error",
      });
    });
  });

  // ---------------- UPDATE ----------------
  describe("updateFornecedor", () => {
    it("deve retornar erro 500 em caso de exceção", async () => {
      (fornecedorRepository.update as jest.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const { req, res } = mockRequestResponse({
        params: { id: "1" },
        body: { nome: "Teste" },
      });

      await fornecedorController.updateFornecedor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao atualizar fornecedor",
        details: "DB error",
      });
    });
  });

  // ---------------- DELETE ----------------
  describe("deleteFornecedor", () => {
    it("deve retornar erro 500 em caso de exceção", async () => {
      (fornecedorRepository.delete as jest.Mock).mockRejectedValue(
        new Error("DB error")
      );

      const { req, res } = mockRequestResponse({ params: { id: "1" } });

      await fornecedorController.deleteFornecedor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao deletar fornecedor",
        details: "DB error",
      });
    });
  });
});
