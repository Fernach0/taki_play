import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  // Público: la app móvil necesita listar mesas sin autenticación
  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  // Solo DJ autenticado puede crear/editar/eliminar mesas
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    return this.tablesService.update(id, updateTableDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tablesService.remove(id);
  }
}
