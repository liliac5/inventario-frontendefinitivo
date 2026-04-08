import { Aula } from './aula.model';
import { Categoria } from './categoria.model';

export interface Bien {
  idBien: number;
  codigo_bien: string;
  codigo_inventario: string;
  codigo_secap: string;
  nombreBien: string;
  descripcion: string;
  tipo_bien: string;
  clase_bien: string;
  cuenta_tipo_bien: string;
  tipo_adquisicion?: string;
  forma_adquisicion?: string;
  marca: string;
  modelo: string;
  serie: string;
  especificaciones: string;
  estado: string;
  detalle_estado: string;
  origen: string;
  provincia: string;
  ubicacion: string;
  custodio: string;
  valor_compra_inicial: number;
  valor_con_iva: number;
  observaciones: string;
  observaciones2: string;
  id_categoria: number;
  categoria?: Categoria;
  aula?: Aula;

}
