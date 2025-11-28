import { Produto, ProdutoCreate, ProdutoUpdate } from "../../models/produto.model.ts";

describe("Produto model", () => {
  it("deveria criar um produto válido", () => {
    const produto: Produto = {
      id: 10,
      nome: "Café Torrado",
      preco: 25.5,
      quantidade: 100,
      categoria: "Bebidas",
      fornecedor_id: 1,
    };

    expect(produto.id).toBe(10);
    expect(produto.nome).toBe("Café Torrado");
    expect(produto.preco).toBe(25.5);
    expect(produto.quantidade).toBe(100);
    expect(produto.categoria).toBe("Bebidas");
    expect(produto.fornecedor_id).toBe(1);
  });

  it("deveria criar um ProdutoCreate obrigatório", () => {
    const novo: ProdutoCreate = {
      nome: "Café Moído",
      preco: 20,
      quantidade: 50,
      categoria: "Bebidas",
      fornecedor_id: 2,
    };

    expect(novo.nome).toBe("Café Moído");
    expect(novo.fornecedor_id).toBe(2);
  });

  it("deveria permitir atualização parcial", () => {
    const update: ProdutoUpdate = { preco: 30 };
    expect(update.preco).toBe(30);
    expect(update.nome).toBeUndefined();
  });
});
