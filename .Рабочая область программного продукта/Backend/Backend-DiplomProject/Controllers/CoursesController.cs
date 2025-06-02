using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Backend_DiplomProject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.DTO;


namespace Backend_DiplomProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CoursesController(AppDbContext context) => _context = context;

        [HttpPost]
        public async Task<IActionResult> CreateCourse([FromForm] CourseFormDto dto)
        {
            if (!ModelState.IsValid)
            {
                // Возвращаем клиенту полные детали ошибок валидации:
                return BadRequest(ModelState);
            }

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Преобразуем icon (IFormFile) в byte[] (может быть null)
            byte[] iconBytes = null;
            if (dto.Icon != null)
            {
                using var ms = new System.IO.MemoryStream();
                await dto.Icon.CopyToAsync(ms);
                iconBytes = ms.ToArray();
            }

            var courseEntity = new Course
            {
                Title = dto.Title,
                Description = dto.Description,
                Icon = iconBytes,
                Dateadd = DateTime.UtcNow.Date,
                Idusername = dto.Idusername,
                Idmonetizationcourse = dto.Idmonetizationcourse,
                Idlevelknowledge = dto.Idlevelknowledge,
                Idcategory = dto.Idcategory,
                Idagepeople = dto.Idagepeople
            };

            await _context.Courses.AddAsync(courseEntity);
            await _context.SaveChangesAsync();

            // Разбор JSON страниц
            List<PageDto> pagesList;
            try
            {
                pagesList = JsonSerializer.Deserialize<List<PageDto>>(
                    dto.PagesJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch
            {
                return BadRequest(new { error = "Невалидный JSON в поле pages." });
            }

            foreach (var p in pagesList)
            {
                if (string.IsNullOrWhiteSpace(p.Content))
                    return BadRequest(new { error = $"Содержимое страницы (order={p.Order}) не может быть пустым." });

                var pageEntity = new Pages
                {
                    Numberpage = p.Order,
                    File = Encoding.UTF8.GetBytes(p.Content),
                    Idcourse = courseEntity.Idcourse
                };
                await _context.Pages.AddAsync(pageEntity);
            }
            await _context.SaveChangesAsync();

            // Если нужна логика с pay…
            if (dto.Idmonetizationcourse == 2)
            {
                bool existsPay = await _context.Pays
                    .AnyAsync(x => x.Idcourse == courseEntity.Idcourse && x.Idusername == dto.Idusername);
                if (!existsPay)
                {
                    var payEntity = new Pay
                    {
                        Idcourse = courseEntity.Idcourse,
                        Idusername = dto.Idusername
                    };
                    await _context.Pays.AddAsync(payEntity);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { message = "Курс успешно создан", idcourse = courseEntity.Idcourse });
        }

        /// <summary>
        /// Обновление курса
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPut("{id:long}")]
        public async Task<IActionResult> UpdateCourse(long id, [FromForm] CourseFormDto dto)
        {
            if (!ModelState.IsValid)
            {
                // Возвращаем клиенту полные детали ошибок валидации:
                return BadRequest(ModelState);
            }

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var courseEntity = await _context.Courses
                .Include(c => c.Pages)
                .FirstOrDefaultAsync(c => c.Idcourse == id);

            if (courseEntity == null)
                return NotFound(new { error = $"Курс с id={id} не найден." });

            // 2. Проверяем права (при необходимости). Здесь полагаем, что idusername не меняется.

            // 3. Валидация полей
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { error = "Поле title не может быть пустым." });

            if (dto.Idusername <= 0)
                return BadRequest(new { error = "Поле idusername неверно." });

            if (dto.Idmonetizationcourse == 2 && (dto.Price == null || dto.Price <= 0))
                return BadRequest(new { error = "Если monetizationType == 2, обязательно укажите price > 0." });

            if (string.IsNullOrWhiteSpace(dto.PagesJson))
                return BadRequest(new { error = "Поле pages не может быть пустым." });

            // 4. Обновляем свойства Course (кроме страниц и связей pay)
            courseEntity.Title = dto.Title;
            courseEntity.Description = dto.Description;
            // Если файл иконки передан — обновляем, иначе оставляем старый
            if (dto.Icon != null)
            {
                using (var ms = new System.IO.MemoryStream())
                {
                    await dto.Icon.CopyToAsync(ms);
                    courseEntity.Icon = ms.ToArray();
                }
            }
            courseEntity.Idmonetizationcourse = dto.Idmonetizationcourse;
            courseEntity.Idlevelknowledge = dto.Idlevelknowledge;
            courseEntity.Idcategory = dto.Idcategory;
            courseEntity.Idagepeople = dto.Idagepeople;
            // courseEntity.Idusername не меняем (меняем только администрированием, если требуется)

            _context.Courses.Update(courseEntity);
            await _context.SaveChangesAsync();

            // 5. Удаляем все старые страницы (Pages) и добавляем новые
            var existingPages = _context.Pages.Where(p => p.Idcourse == id);
            _context.Pages.RemoveRange(existingPages);
            await _context.SaveChangesAsync();

            List<PageDto> pagesList;
            try
            {
                pagesList = JsonSerializer.Deserialize<List<PageDto>>(dto.PagesJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (Exception)
            {
                return BadRequest(new { error = "Невалидный JSON в поле pages." });
            }

            foreach (var p in pagesList)
            {
                if (string.IsNullOrWhiteSpace(p.Content))
                    return BadRequest(new { error = $"Содержимое страницы (order={p.Order}) не может быть пустым." });

                var pageEntity = new Pages
                {
                    Numberpage = p.Order,
                    File = Encoding.UTF8.GetBytes(p.Content),
                    Idcourse = courseEntity.Idcourse
                };
                await _context.Pages.AddAsync(pageEntity);
            }
            await _context.SaveChangesAsync();

            // 6. Работа с таблицей Pay:
            //    - Если монетизация == 2, проверяем наличие записи (Idcourse, Idusername). Если нет — создаём.
            //    - Если монетизация != 2, удаляем существующие записи pay (если они были).
            var existingPay = await _context.Pays
                .FirstOrDefaultAsync(x => x.Idcourse == courseEntity.Idcourse && x.Idusername == dto.Idusername);

            if (dto.Idmonetizationcourse == 2)
            {
                if (existingPay == null)
                {
                    var payEntity = new Pay
                    {
                        Idcourse = courseEntity.Idcourse,
                        Idusername = dto.Idusername
                    };
                    await _context.Pays.AddAsync(payEntity);
                    await _context.SaveChangesAsync();
                }
                // Если уже есть existingPay, оставляем как есть.
            }
            else
            {
                // Если раньше был pay, а теперь его не должно быть — удаляем
                if (existingPay != null)
                {
                    _context.Pays.Remove(existingPay);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { message = "Курс успешно обновлён" });
        }
    }
}
