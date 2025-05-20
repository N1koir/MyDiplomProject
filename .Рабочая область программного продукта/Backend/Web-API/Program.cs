using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;

namespace Web_API
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

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\nПодключение к PostgreSQL\n");
            Console.ResetColor();

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQLConnection"))
                .LogTo(Console.WriteLine) // Логи в консоль
                .EnableSensitiveDataLogging()
                );

            // Добавление сервисов Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Test API",
                    Description = "Тестирование API Knowledge+ - образовательной платформы"
                });
            });

            builder.Services.AddControllers();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:3000")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            var app = builder.Build();

            // Настройка Swagger UI
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Education API v1");
                    c.RoutePrefix = "swagger";
                });
            }

            // Проверка подключения к БД
            await CheckDatabaseConnection(app);

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\nУспешный запуск API ASP.NET веб-платформы Knowledge+\n");

            app.UseCors("AllowFrontend");
            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();

            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("##########################################################");
            Console.WriteLine("#  Журнал действий API ASP.NET веб-платформы Knowledge+  #");
            Console.WriteLine("##########################################################\n");
            Console.ResetColor();

            app.Run();
            await app.RunAsync();
        }

        private static async Task CheckDatabaseConnection(WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var services = scope.ServiceProvider;

            try
            {
                var dbContext = services.GetRequiredService<ApplicationDbContext>();

                if (!await dbContext.Database.CanConnectAsync())
                {
                    throw new Exception("Не удалось подключиться к базе данных");
                }

                await dbContext.Database.MigrateAsync();
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\nПодключение к базе данных успешно установлено!\n");
                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("##################################################");
                Console.WriteLine("Критическая ошибка базы данных:");
                Console.WriteLine(ex.Message);
                Console.WriteLine("##################################################");
                Console.WriteLine("\nОшибка запуска API ASP.NET веб-платформы Knowledge+");
                Console.WriteLine("Запуск аварийно завершён!");
                Console.ResetColor();
                Environment.Exit(1);
            }
        }
    }
}