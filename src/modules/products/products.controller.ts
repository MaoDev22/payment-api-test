import { Controller, Post, HttpCode, Body } from '@nestjs/common';

import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {

    constructor(
        private readonly productsService: ProductsService,
    ) {}

  @Post('filter-products')
  @HttpCode(200)
  async validate(@Body() body: { searchText: String}) {
    const textSearch = body.searchText;

    return await this.productsService.filterProducts(textSearch);
  }
}
