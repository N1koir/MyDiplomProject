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
    public class CoursesControllerCreateAndEdit : ControllerBase
    {
        private readonly AppDbContext _context;
        public CoursesControllerCreateAndEdit(AppDbContext context) => _context = context;

        /// <summary>
        /// Создание курса
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateCourse([FromForm] CourseFormDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            byte[] iconBytes = null;
            if (dto.Icon != null)
            {
                using var ms = new System.IO.MemoryStream();
                await dto.Icon.CopyToAsync(ms);
                iconBytes = ms.ToArray();
            }

            // Десериализуем JSON-строку pages
            List<PageDto> pagesList;
            try
            {
                pagesList = JsonSerializer.Deserialize<List<PageDto>>(dto.PagesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch
            {
                return BadRequest(new { error = "Невалидный JSON в поле pages." });
            }

            if (pagesList == null || pagesList.Count == 0)
                return BadRequest(new { error = "Должна быть хотя бы одна страница." });

            var courseEntity = new Course
            {
                Title = dto.Title,
                Description = dto.Description,
                Icon = iconBytes,
                Dateadd = DateTime.UtcNow.Date,
                Idusername = dto.Idusername,
                Idmonetizationcourse = dto.Idmonetizationcourse,

                Price = (dto.Idmonetizationcourse == 2 && dto.Price.HasValue)
                            ? dto.Price.Value
                            : null,

                Idlevelknowledge = dto.Idlevelknowledge,
                Idcategory = dto.Idcategory,
                Idagepeople = dto.Idagepeople
            };

            await _context.Courses.AddAsync(courseEntity);
            await _context.SaveChangesAsync();

            foreach (var p in pagesList)
            {
                if (string.IsNullOrWhiteSpace(p.Content))
                    return BadRequest(new { error = $"Содержимое страницы order={p.Order} не может быть пустым." });

                var pageEntity = new Pages
                {
                    Numberpage = p.Order,
                    File = Encoding.UTF8.GetBytes(p.Content),
                    Idcourse = courseEntity.Idcourse
                };
                await _context.Pages.AddAsync(pageEntity);
            }
            await _context.SaveChangesAsync();

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

            return Ok(new
            {
                message = "Курс успешно создан",
                idcourse = courseEntity.Idcourse
            });
        }

        /// <summary>
        /// Редактирование курса
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPut("{id:long}")]
        public async Task<IActionResult> UpdateCourse(long id, [FromForm] CourseFormDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var courseEntity = await _context.Courses
                .Include(c => c.Pages)
                .FirstOrDefaultAsync(c => c.Idcourse == id);
            if (courseEntity == null)
                return NotFound(new { error = $"Курс с id={id} не найден." });

            courseEntity.Title = dto.Title;
            courseEntity.Description = dto.Description;
            courseEntity.Dateadd = DateTime.UtcNow.Date;

            if (dto.Icon != null)
            {
                using var ms = new System.IO.MemoryStream();
                await dto.Icon.CopyToAsync(ms);
                courseEntity.Icon = ms.ToArray();
            }

            courseEntity.Idmonetizationcourse = dto.Idmonetizationcourse;

            courseEntity.Price = (dto.Idmonetizationcourse == 2 && dto.Price.HasValue)
                                     ? dto.Price.Value
                                     : null;

            courseEntity.Idlevelknowledge = dto.Idlevelknowledge;
            courseEntity.Idcategory = dto.Idcategory;
            courseEntity.Idagepeople = dto.Idagepeople;

            _context.Courses.Update(courseEntity);
            await _context.SaveChangesAsync();

            _context.Pages.RemoveRange(courseEntity.Pages);
            await _context.SaveChangesAsync();

            // Сохраняем новые страницы из JSON
            List<PageDto> pagesList;
            try
            {
                pagesList = JsonSerializer.Deserialize<List<PageDto>>(dto.PagesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch
            {
                return BadRequest(new { error = "Невалидный JSON в поле pages." });
            }

            foreach (var p in pagesList)
            {
                if (string.IsNullOrWhiteSpace(p.Content))
                    return BadRequest(new { error = $"Содержимое страницы order={p.Order} не может быть пустым." });

                var pageEntity = new Pages
                {
                    Numberpage = p.Order,
                    File = Encoding.UTF8.GetBytes(p.Content),
                    Idcourse = courseEntity.Idcourse
                };
                await _context.Pages.AddAsync(pageEntity);
            }
            await _context.SaveChangesAsync();

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
            }
            else
            {
                if (existingPay != null)
                {
                    _context.Pays.Remove(existingPay);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { message = "Курс успешно обновлён", idcourse = courseEntity.Idcourse });
        }

        /// <summary>
        /// Загрузка для редактирования курса
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourse(long id)
        {
            var courseEntity = await _context.Courses
                .AsNoTracking()
                .Include(c => c.Pages)
                .FirstOrDefaultAsync(c => c.Idcourse == id);

            if (courseEntity == null)
                return NotFound(new { message = $"Курс с id={id} не найден." });

            // Конвертация иконки (byte[]) в base64 data URI (если есть)
            string? iconUri = null;
            if (courseEntity.Icon != null && courseEntity.Icon.Length > 0)
            {
                iconUri = $"data:image/png;base64,{Convert.ToBase64String(courseEntity.Icon)}";
            }

            var dto = new CourseDetailDto
            {
                IdCourse = courseEntity.Idcourse,
                Title = courseEntity.Title,
                Description = courseEntity.Description,
                MonetizationType = courseEntity.Idmonetizationcourse,
                Price = courseEntity.Price,
                Category = courseEntity.Idcategory,
                AgeRestriction = courseEntity.Idagepeople,
                Level = courseEntity.Idlevelknowledge,
                IconBase64 = iconUri,
                Pages = courseEntity.Pages
                    .OrderBy(p => p.Numberpage)
                    .Select(p => new PageDetailDto
                    {
                        Order = p.Numberpage,
                        Content = Encoding.UTF8.GetString(p.File)
                    })
                    .ToList()
            };

            return Ok(dto);
        }
    }
}