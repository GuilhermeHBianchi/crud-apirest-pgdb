import { Fornecedor, FornecedorCreate, FornecedorUpdate } from "../../models/fornecedor.model.ts";

describe("Fornecedor model", () => {
  it("deveria criar um fornecedor válido", () => {
    const fornecedor: Fornecedor = {
      id: 1,
      nome: "Café Brasil",
      cnpj: "1234567890001",
      email: "contato@cafebrasil.com",
    };

    expect(fornecedor.id).toBe(1);
    expect(fornecedor.nome).toBe("Café Brasil");
    expect(fornecedor.cnpj).toBe("1234567890001");
    expect(fornecedor.email).toBe("contato@cafebrasil.com");
  });

  it("deveria aceitar criação sem campos opcionais", () => {
    const novo: FornecedorCreate = {
      nome: "Fornecedor Simples",
      cnpj: "9876543210001",
    };

    expect(novo.nome).toBe("Fornecedor Simples");
    expect(novo.cnpj).toBe("9876543210001");
    expect(novo.email).toBeUndefined();
  });

  it("deveria permitir atualização parcial", () => {
    const update: FornecedorUpdate = { telefone: "11999999999" };
    expect(update.telefone).toBe("11999999999");
    expect(update.nome).toBeUndefined();
  });
});
