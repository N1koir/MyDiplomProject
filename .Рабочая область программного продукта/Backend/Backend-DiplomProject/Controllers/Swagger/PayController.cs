using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;
using Backend_DiplomProject;

namespace Backend_DiplomProject.Controllers.Swagger;

[Route("api/[controller]")]
[ApiController]
public class PayController : ControllerBase
{
    private readonly AppDbContext _context;

    public PayController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Pay>>> GetAll()
        => await _context.Pays.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Pay>> GetById(long id)
    {
        var item = await _context.Pays.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<Pay>> Create(Pay item)
    {
        _context.Pays.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Idpay }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, Pay item)
    {
        if (id != item.Idpay) return BadRequest();

        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var item = await _context.Pays.FindAsync(id);
        if (item == null) return NotFound();

        _context.Pays.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}