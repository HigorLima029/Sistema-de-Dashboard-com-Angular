import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { cpfValidator } from '../../core/validators';
import { NewProductInput, Product, ProductsStore } from '../../core/products.store';
import { StockService } from '../../core/stock.service';
import { IconComponent } from '../../shared/icon/icon';
import { ModalComponent } from '../../shared/modal/modal';
import { SkeletonComponent } from '../../shared/skeleton/skeleton';
import { TableComponent } from '../../shared/table/table';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DecimalPipe,
    IconComponent,
    TableComponent,
    ModalComponent,
    SkeletonComponent,
  ],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss',
})
export class ProdutosComponent {
  private readonly productsStore = inject(ProductsStore);
  private readonly fb = inject(FormBuilder);
  readonly stock = inject(StockService);

  readonly loading = this.productsStore.loading;
  readonly products = this.productsStore.products;
  readonly search = signal('');
  readonly selectedCategory = signal<string>('todas');
  readonly selectedProduct = signal<Product | null>(null);
  readonly saidaProduct = signal<Product | null>(null);
  readonly novoProdutoOpen = signal(false);

  readonly stepById = signal<Record<number, number>>({});

  readonly categories = computed(() => {
    const set = new Set(this.products().map((p) => p.category));
    return ['todas', ...Array.from(set)];
  });

  readonly filteredProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.products().filter((p) => {
      const matchesCategory = category === 'todas' || p.category === category;
      const matchesSearch = !term || p.title.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  });

  readonly saidaForm = this.fb.nonNullable.group({
    quantidade: [1, [Validators.required, Validators.min(1)]],
    destinatario: ['', Validators.required],
    cpf: ['', [Validators.required, cpfValidator]],
    cliente: ['', Validators.required],
    endereco: ['', Validators.required],
  });

  readonly novoProdutoForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    quantidadeInicial: [10, [Validators.required, Validators.min(0)]],
    image: [''],
    description: [''],
  });

  constructor() {
    // sempre que a store de produtos atualizar, garante quantidade inicial no estoque
    effect(() => {
      const items = this.products();
      if (items.length > 0) {
        this.stock.ensureSeeded(items.map((p) => p.id));
      }
    });
  }

  stepFor(productId: number): number {
    return this.stepById()[productId] ?? 1;
  }

  setStep(productId: number, value: string): void {
    const parsed = Math.max(1, Number(value) || 1);
    this.stepById.update((current) => ({ ...current, [productId]: parsed }));
  }

  registrarEntrada(product: Product): void {
    const quantidade = this.stepFor(product.id);
    this.stock.registrarMovimento(product.id, product.title, 'entrada', quantidade);
  }

  isLowStock(productId: number): boolean {
    return this.stock.quantityFor(productId) < this.stock.lowStockThreshold;
  }

  abrirDetalhes(product: Product): void {
    this.selectedProduct.set(product);
  }

  fecharDetalhes(): void {
    this.selectedProduct.set(null);
  }

  abrirSaida(product: Product): void {
    this.selectedProduct.set(null);
    this.saidaForm.reset({
      quantidade: this.stepFor(product.id),
      destinatario: '',
      cpf: '',
      cliente: '',
      endereco: '',
    });
    this.saidaProduct.set(product);
  }

  fecharSaida(): void {
    this.saidaProduct.set(null);
  }

  confirmarSaida(): void {
    if (this.saidaForm.invalid) {
      this.saidaForm.markAllAsTouched();
      return;
    }

    const product = this.saidaProduct();
    if (!product) return;

    const { quantidade, destinatario, cpf, cliente, endereco } = this.saidaForm.getRawValue();

    this.stock.registrarMovimento(product.id, product.title, 'saida', quantidade, {
      recipientName: destinatario,
      cpf,
      client: cliente,
      address: endereco,
    });

    this.fecharSaida();
  }

  abrirNovoProduto(): void {
    this.novoProdutoForm.reset({
      title: '',
      category: '',
      price: 0,
      quantidadeInicial: 10,
      image: '',
      description: '',
    });
    this.novoProdutoOpen.set(true);
  }

  fecharNovoProduto(): void {
    this.novoProdutoOpen.set(false);
  }

  confirmarNovoProduto(): void {
    if (this.novoProdutoForm.invalid) {
      this.novoProdutoForm.markAllAsTouched();
      return;
    }

    const { title, category, price, quantidadeInicial, image, description } = this.novoProdutoForm.getRawValue();

    const input: NewProductInput = {
      title,
      category,
      price,
      image: image.trim() || 'https://placehold.co/300x300?text=Produto',
      description: description.trim() || 'Produto cadastrado manualmente.',
    };

    const created = this.productsStore.addProduct(input);
    this.stock.definirQuantidade(created.id, quantidadeInicial);
    this.fecharNovoProduto();
  }
}
