using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;

namespace Backend_DiplomProject.Controllers.Swagger;

[Route("api/[controller]")]
[ApiController]
public class CategoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoryController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetAll()
        => await _context.Categories.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetById(int id)
    {
        var item = await _context.Categories.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Category>> Create(Category item)
    {
        _context.Categories.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Idcategory }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Category item)
    {
        if (id != item.Idcategory) return BadRequest();

        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Categories.FindAsync(id);
        if (item == null) return NotFound();

        _context.Categories.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}