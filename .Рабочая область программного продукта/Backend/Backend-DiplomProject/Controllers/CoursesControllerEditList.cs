// Controllers/CoursesControllerEditList.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend_DiplomProject.DTO;
using Backend_DiplomProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_DiplomProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesControllerEditList : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        private readonly AppDbContext _context;

        public CoursesControllerEditList(AppDbContext dbContext, AppDbContext context)
        {
            _dbContext = dbContext;
            _context = context;
        }

        /// <summary>
        /// Загрузка списка "Редактор курсов"
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="search"></param>
        /// <returns></returns>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetCoursesByUser(long userId, [FromQuery] string? search = null)
        {
            bool userExists = await _dbContext.Usernames
                .AsNoTracking()
                .AnyAsync(u => u.Idusername == userId);

            if (!userExists)
            {
                return NotFound(new { message = $"Пользователь с id={userId} не найден." });
            }

            var query = _dbContext.Courses
                .AsNoTracking()
                .Where(c => c.Idusername == userId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                string lowered = search.Trim().ToLower();
                query = query.Where(c => c.Title.ToLower().Contains(lowered));
            }

            var result = await query
                .OrderByDescending(c => c.Dateadd)
                .Select(c => new CourseDto
                {
                    IdCourse = c.Idcourse,
                    Title = c.Title,
                    DateAdd = c.Dateadd
                })
                .ToListAsync();

            return Ok(result);
        }

        /// <summary>
        /// Удаление личного курса из "Редактор курсов"
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(long id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound();

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}