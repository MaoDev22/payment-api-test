import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './product.entity';

import { DEFAULT_PRODUCTS } from '@app/common/constants/products.constants';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    await this.createDefaultProducts();
  }

  private async createDefaultProducts() {
    for (const product of DEFAULT_PRODUCTS) {
      const productExists = await this.productRepository.findOne({ where: { name: product.name } });
      
      if (!productExists) {
        const role = this.productRepository.create({
            cover_image: product.cover_image,
            name: product.name,
            description: product.description,
            amount: product.amount,
            currency: product.currency,
            quantity: product.quantity
        });
        await this.productRepository.save(role);
      }
    }
  }

  async filterProducts(textSearch: String): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.name) LIKE LOWER(:name)', { name: `%${textSearch}%` })
      .getMany();
  }
}