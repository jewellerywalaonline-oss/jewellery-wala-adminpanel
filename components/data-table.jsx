"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subMonths, parseISO } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DataTable({
  data,
  columns,
  onEdit,
  onDelete,
  selectOption,
  dateOption,
  searchPlaceholder = "Search...",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [dateFilter, setDateFilter] = useState({
    type: "all", // 'all', 'lastMonth', 'custom'
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [filteredData, setFilteredData] = useState(data);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSelectChange = (value) => {
    setSelectedOption(value);
    setCurrentPage(1);
    const filteredData = data.filter((item) => item.status === value);
    setFilteredData(filteredData);
  };

  useEffect(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply date filter
    if (dateFilter.type === "lastMonth") {
      const lastMonth = subMonths(new Date(), 1);
      result = result.filter((item) => {
        const itemDate = new Date(
          item.createdAt || item.date || item.orderDate
        );
        return (
          itemDate.getMonth() === lastMonth.getMonth() &&
          itemDate.getFullYear() === lastMonth.getFullYear()
        );
      });
    } else if (dateFilter.type === "custom") {
      result = result.filter((item) => {
        const itemDate = new Date(
          item.createdAt || item.date || item.orderDate
        );
        return (
          itemDate.getMonth() === dateFilter.month &&
          itemDate.getFullYear() === dateFilter.year
        );
      });
    }

    setFilteredData(result);
  }, [searchTerm, dateFilter, data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-300">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 transition-all duration-200 focus:scale-[1.02]"
          />
        </div>
        {selectOption && (
          <div className=" w-[200px]">
            <Select value={selectedOption} onValueChange={handleSelectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {selectOption?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {dateOption && (
          <div className="flex items-center gap-2">
            <Select
              value={dateFilter.type}
              onValueChange={(value) =>
                setDateFilter((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter.type === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !dateFilter.month && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFilter.month !== undefined && dateFilter.year
                      ? `${new Date(0, dateFilter.month).toLocaleString(
                          "default",
                          { month: "long" }
                        )} ${dateFilter.year}`
                      : "Select month"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={new Date(dateFilter.year, dateFilter.month)}
                    onSelect={(date) => {
                      if (date) {
                        setDateFilter((prev) => ({
                          ...prev,
                          month: date.getMonth(),
                          year: date.getFullYear(),
                        }));
                      }
                    }}
                    initialFocus
                    defaultMonth={new Date(dateFilter.year, dateFilter.month)}
                    toMonth={new Date()}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column, index) => (
                <TableHead
                  key={column.key}
                  className="font-semibold animate-in fade-in slide-in-from-top"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, rowIndex) => (
              <TableRow
                key={item._id}
                className="transition-all duration-200 hover:bg-muted/50 animate-in fade-in slide-in-from-left"
                style={{ animationDelay: `${rowIndex * 30}ms` }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(item) : item[column.key]}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      className="transition-all duration-200 hover:scale-110"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item._id)}
                      className="transition-all duration-200 hover:scale-110 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom duration-300">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="transition-all duration-200 hover:scale-105"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
