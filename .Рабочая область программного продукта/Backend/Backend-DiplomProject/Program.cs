using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Reflection;

namespace Backend_DiplomProject
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("###################################################");
            Console.WriteLine("#   Запуск API ASP.NET веб-платформы Knowledge+   #");
            Console.WriteLine("###################################################");
            Console.ResetColor();

            // Конфигурация сервисов
            builder.Services.AddControllers();
            ConfigureSwagger(builder.Services);
            ConfigureCors(builder.Services);
            ConfigureDatabase(builder, builder.Configuration);

            var app = builder.Build();

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("ViteReactPolicy");
            app.UseAuthorization();
            app.MapControllers();

            // Применение миграций и проверка БД
            await ApplyMigrationsAndCheckDb(app);

            // Запуск Swagger только в Development
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Diplom API v1");
                    c.ConfigObject.DisplayRequestDuration = true;
                });
            }

            app.Run();

            // Настройка Swagger
            void ConfigureSwagger(IServiceCollection services)
            {
                services.AddEndpointsApiExplorer();
                services.AddSwaggerGen(c =>
                {
                    c.SwaggerDoc("v1", new OpenApiInfo
                    {
                        Title = "Diplom API",
                        Version = "v1",
                        Description = "API для дипломного проекта"
                    });

                    // Фильтрация по namespace для Swagger-контроллеров
                    c.DocInclusionPredicate((docName, apiDesc) =>
                    {
                        var controllerActionDescriptor = apiDesc.ActionDescriptor as Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor;
                        if (controllerActionDescriptor == null) return false;

                        var controllerNamespace = controllerActionDescriptor.ControllerTypeInfo.Namespace;


                        return controllerNamespace != null &&
                               controllerNamespace.StartsWith("Backend_DiplomProject.Controllers.Swagger");
                    });
                });
            }

            // Настройка CORS
            void ConfigureCors(IServiceCollection services)
            {
                services.AddCors(options =>
                {
                    options.AddPolicy("ViteReactPolicy", policy =>
                    {
                        policy.WithOrigins("http://localhost:5173")
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    });
                });
            }

            // Подключение и настройка базы данных
            void ConfigureDatabase(WebApplicationBuilder builder, IConfiguration configuration)
            {
                builder.Services.AddDbContext<AppDbContext>(options =>
                    options.UseNpgsql(configuration.GetConnectionString("PostgreSQLConnection"))
                        .LogTo(Console.WriteLine)
                        .EnableSensitiveDataLogging());
            }

            // Увеличивание лимитов данных
            builder.Services.Configure<IISServerOptions>(options =>
            {
                options.MaxRequestBodySize = 500 * 1024 * 1024; // 500MB
            });

            // Метод для применения миграций и проверки БД
            async Task ApplyMigrationsAndCheckDb(WebApplication app)
            {
                using var scope = app.Services.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                try
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("\nПроверка подключения к БД...\n");
                    Console.ResetColor();

                    await dbContext.Database.OpenConnectionAsync();
                    await dbContext.Database.CloseConnectionAsync();

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("\nПодключение к БД успешно установлено\n");
                    Console.ResetColor();

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Применение миграций...\n");
                    Console.ResetColor();

                    await dbContext.Database.MigrateAsync();

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("\nМиграции успешно применены\n");
                    Console.ResetColor();
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"\nОшибка подключения к БД: {ex.Message}");
                    Console.WriteLine("Приложение продолжит работу, но функциональность БД недоступна\n");
                    Console.ResetColor();
                }

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Успешный запуск API ASP.NET веб-платформы Knowledge+\n");
                Console.ResetColor();

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("###################################################");
                Console.WriteLine("#   Журнал API ASP.NET веб-платформы Knowledge+   #");
                Console.WriteLine("###################################################");
                Console.WriteLine("");
                Console.ResetColor();
            }
        }
    }
}