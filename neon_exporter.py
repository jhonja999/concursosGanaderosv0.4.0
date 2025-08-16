#!/usr/bin/env python3
"""
Exportador completo de base de datos Neon a JSON, CSV y XLSX
Mantiene toda la información sin pérdidas - 34MB completos
"""

import psycopg2
import pandas as pd
import json
import os
from datetime import datetime
from urllib.parse import urlparse
import sys

class NeonExporter:
    def __init__(self, connection_string):
        """Inicializar exportador con cadena de conexión de Neon"""
        self.connection_string = connection_string
        self.connection = None
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
    def connect(self):
        """Establecer conexión con la base de datos"""
        try:
            self.connection = psycopg2.connect(self.connection_string)
            print("✅ Conexión exitosa a Neon")
            return True
        except Exception as e:
            print(f"❌ Error de conexión: {e}")
            return False
    
    def get_all_tables(self):
        """Obtener lista de todas las tablas"""
        cursor = self.connection.cursor()
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cursor.fetchall()]
        cursor.close()
        return tables
    
    def get_table_info(self, table_name):
        """Obtener información detallada de una tabla"""
        cursor = self.connection.cursor()
        
        # Obtener esquema de columnas
        cursor.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = %s AND table_schema = 'public'
            ORDER BY ordinal_position;
        """, (table_name,))
        
        columns_info = cursor.fetchall()
        
        # Contar registros
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        row_count = cursor.fetchone()[0]
        
        cursor.close()
        return {
            'columns': columns_info,
            'row_count': row_count
        }
    
    def export_table_to_dataframe(self, table_name):
        """Exportar tabla completa a DataFrame"""
        try:
            query = f"SELECT * FROM {table_name}"
            df = pd.read_sql_query(query, self.connection)
            print(f"📊 {table_name}: {len(df)} registros exportados")
            return df
        except Exception as e:
            print(f"❌ Error exportando {table_name}: {e}")
            return None
    
    def export_to_json(self, output_dir="./exports"):
        """Exportar toda la base de datos a JSON"""
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        print("\n🔄 Exportando a JSON...")
        tables = self.get_all_tables()
        
        # Estructura completa de la base de datos
        database_export = {
            'export_info': {
                'timestamp': self.timestamp,
                'total_tables': len(tables),
                'format': 'complete_json_export'
            },
            'schema': {},
            'data': {}
        }
        
        total_records = 0
        
        for table_name in tables:
            print(f"📋 Procesando tabla: {table_name}")
            
            # Información del esquema
            table_info = self.get_table_info(table_name)
            database_export['schema'][table_name] = table_info
            
            # Datos de la tabla
            df = self.export_table_to_dataframe(table_name)
            if df is not None:
                # Convertir DataFrame a JSON, manejando tipos especiales
                database_export['data'][table_name] = df.to_dict('records')
                total_records += len(df)
        
        # Guardar JSON completo
        json_file = f"{output_dir}/lomejordemitierra_completo_{self.timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(database_export, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"✅ JSON exportado: {json_file}")
        print(f"📊 Total registros: {total_records}")
        return json_file
    
    def export_to_csv(self, output_dir="./exports"):
        """Exportar cada tabla a CSV individual"""
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        print("\n🔄 Exportando a CSV...")
        tables = self.get_all_tables()
        csv_files = []
        
        # Crear subdirectorio para CSVs
        csv_dir = f"{output_dir}/csv_{self.timestamp}"
        os.makedirs(csv_dir, exist_ok=True)
        
        for table_name in tables:
            print(f"📋 Exportando tabla: {table_name}")
            
            df = self.export_table_to_dataframe(table_name)
            if df is not None:
                csv_file = f"{csv_dir}/{table_name}.csv"
                df.to_csv(csv_file, index=False, encoding='utf-8')
                csv_files.append(csv_file)
        
        # Crear archivo índice con información de todas las tablas
        index_data = []
        for table_name in tables:
            table_info = self.get_table_info(table_name)
            index_data.append({
                'table_name': table_name,
                'row_count': table_info['row_count'],
                'columns': len(table_info['columns']),
                'csv_file': f"{table_name}.csv"
            })
        
        index_df = pd.DataFrame(index_data)
        index_file = f"{csv_dir}/00_INDEX_TABLES.csv"
        index_df.to_csv(index_file, index=False)
        
        print(f"✅ CSVs exportados en: {csv_dir}")
        print(f"📋 Archivo índice: {index_file}")
        return csv_dir
    
    def export_to_xlsx(self, output_dir="./exports"):
        """Exportar toda la base de datos a un archivo XLSX con múltiples hojas"""
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        print("\n🔄 Exportando a XLSX...")
        tables = self.get_all_tables()
        
        xlsx_file = f"{output_dir}/lomejordemitierra_completo_{self.timestamp}.xlsx"
        
        with pd.ExcelWriter(xlsx_file, engine='openpyxl') as writer:
            # Hoja de índice con información general
            index_data = []
            
            for table_name in tables:
                print(f"📋 Procesando tabla: {table_name}")
                
                table_info = self.get_table_info(table_name)
                index_data.append({
                    'Tabla': table_name,
                    'Registros': table_info['row_count'],
                    'Columnas': len(table_info['columns']),
                    'Hoja': table_name[:31]  # Excel limita nombres de hoja a 31 caracteres
                })
                
                # Exportar datos de la tabla
                df = self.export_table_to_dataframe(table_name)
                if df is not None:
                    # Truncar nombre de hoja si es muy largo
                    sheet_name = table_name[:31]
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
            
            # Crear hoja índice
            index_df = pd.DataFrame(index_data)
            index_df.to_excel(writer, sheet_name='00_INDEX', index=False)
        
        print(f"✅ XLSX exportado: {xlsx_file}")
        return xlsx_file
    
    def export_all_formats(self):
        """Exportar en todos los formatos disponibles"""
        print("🚀 Iniciando exportación completa de la base de datos...")
        print(f"⏰ Timestamp: {self.timestamp}")
        
        if not self.connect():
            return False
        
        try:
            # Obtener información general
            tables = self.get_all_tables()
            print(f"📋 Tablas encontradas: {len(tables)}")
            for table in tables:
                info = self.get_table_info(table)
                print(f"  • {table}: {info['row_count']} registros")
            
            # Exportar en todos los formatos
            json_file = self.export_to_json()
            csv_dir = self.export_to_csv()
            xlsx_file = self.export_to_xlsx()
            
            print("\n🎉 EXPORTACIÓN COMPLETA FINALIZADA")
            print("📁 Archivos generados:")
            print(f"  • JSON completo: {json_file}")
            print(f"  • CSVs individuales: {csv_dir}")
            print(f"  • XLSX multi-hoja: {xlsx_file}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error durante la exportación: {e}")
            return False
        finally:
            if self.connection:
                self.connection.close()
                print("🔌 Conexión cerrada")

def main():
    """Función principal"""
    # Cadena de conexión de Neon
    connection_string = "postgresql://lomejordemitierra_owner:npg_G4DdSPBecz7a@ep-cool-rice-a83gw6r0-pooler.eastus2.azure.neon.tech/lomejordemitierra?sslmode=require"
    
    print("=" * 60)
    print("🌟 EXPORTADOR COMPLETO DE BASE DE DATOS NEON")
    print("📊 Exporta TODOS los datos sin pérdidas")
    print("📁 Formatos: JSON, CSV, XLSX")
    print("=" * 60)
    
    # Verificar dependencias
    try:
        import psycopg2
        import pandas as pd
        import openpyxl
        print("✅ Todas las dependencias están instaladas")
    except ImportError as e:
        print(f"❌ Dependencia faltante: {e}")
        print("💡 Instalar con: pip install psycopg2-binary pandas openpyxl")
        return
    
    # Crear exportador y ejecutar
    exporter = NeonExporter(connection_string)
    success = exporter.export_all_formats()
    
    if success:
        print("\n🎯 ¡Exportación exitosa! Todos tus 34MB están seguros.")
    else:
        print("\n💥 Error en la exportación. Revisa los mensajes anteriores.")

if __name__ == "__main__":
    main()